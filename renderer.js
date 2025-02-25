const { ipcRenderer } = require('electron');
const React = require('react');
const ReactDOM = require('react-dom/client'); // Importação atualizada
const { DragDropContext, Droppable, Draggable } = require('react-beautiful-dnd');

// Componente de cartão de tarefa
const TaskCard = ({ task, index, onEditTask }) => {
  return React.createElement(
    Draggable,
    { draggableId: task.id, index: index },
    (provided) => {
      return React.createElement(
        'div',
        {
          className: 'task-card',
          ref: provided.innerRef,
          ...provided.draggableProps,
          ...provided.dragHandleProps,
          onClick: () => onEditTask(task.id)
        },
        React.createElement('div', { className: 'task-title' }, task.title),
        React.createElement('div', { className: 'task-description' }, task.description)
      );
    }
  );
};

// Componente de formulário para adicionar/editar tarefas
const TaskForm = ({ columnId, task = null, onSave, onCancel }) => {
  const [title, setTitle] = React.useState(task ? task.title : '');
  const [description, setDescription] = React.useState(task ? task.description : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(columnId, {
        id: task ? task.id : Date.now().toString(),
        title: title.trim(),
        description: description.trim()
      });
      setTitle('');
      setDescription('');
    }
  };

  return React.createElement(
    'form',
    { className: 'task-form', onSubmit: handleSubmit },
    React.createElement('input', {
      type: 'text',
      value: title,
      onChange: (e) => setTitle(e.target.value),
      placeholder: 'Título da tarefa',
      autoFocus: true
    }),
    React.createElement('textarea', {
      value: description,
      onChange: (e) => setDescription(e.target.value),
      placeholder: 'Descrição',
      rows: 3
    }),
    React.createElement(
      'div',
      { className: 'task-form-buttons' },
      React.createElement(
        'button',
        { type: 'button', className: 'cancel-btn', onClick: onCancel },
        'Cancelar'
      ),
      React.createElement(
        'button',
        { type: 'submit', className: 'save-btn' },
        'Salvar'
      )
    )
  );
};

// Componente de coluna
const Column = ({ column, tasks, onAddTask, onEditTask, activeForm, setActiveForm }) => {
  return React.createElement(
    'div',
    { className: 'column' },
    React.createElement('div', { className: 'column-title' }, column.title),
    React.createElement(
      Droppable,
      { droppableId: column.id },
      (provided) => {
        return React.createElement(
          'div',
          {
            className: 'task-list',
            ref: provided.innerRef,
            ...provided.droppableProps
          },
          tasks.map((task, index) => 
            React.createElement(TaskCard, { 
              key: task.id, 
              task, 
              index, 
              onEditTask: onEditTask 
            })
          ),
          provided.placeholder,
          activeForm === column.id ? 
            React.createElement(TaskForm, {
              columnId: column.id,
              onSave: onAddTask,
              onCancel: () => setActiveForm(null)
            }) : 
            React.createElement(
              'button',
              {
                className: 'add-task-btn',
                onClick: () => setActiveForm(column.id)
              },
              '+ Adicionar tarefa'
            )
        );
      }
    )
  );
};

// Componente principal do aplicativo Kanban
const App = () => {
  const [boardData, setBoardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [activeForm, setActiveForm] = React.useState(null);
  const [editingTask, setEditingTask] = React.useState(null);

  // Carrega os dados ao iniciar
  React.useEffect(() => {
    const loadData = async () => {
      const data = await ipcRenderer.invoke('load-board');
      setBoardData(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Salva os dados quando houver alterações
  React.useEffect(() => {
    if (boardData && !loading) {
      ipcRenderer.send('save-board', boardData);
    }
  }, [boardData, loading]);

  // Manipula a adição/edição de tarefas
  const handleSaveTask = (columnId, task) => {
    const newBoardData = { ...boardData };

    // Se for uma nova tarefa
    if (!newBoardData.tasks[task.id]) {
      newBoardData.tasks[task.id] = task;
      newBoardData.columns[columnId].taskIds.push(task.id);
    } else { // Se for uma tarefa existente
      newBoardData.tasks[task.id] = task;
    }

    setBoardData(newBoardData);
    setActiveForm(null);
    setEditingTask(null);
  };

  // Manipula o drag and drop
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Se não houver destino ou for o mesmo local, não faz nada
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }

    const startColumn = boardData.columns[source.droppableId];
    const endColumn = boardData.columns[destination.droppableId];

    if (startColumn === endColumn) {
      // Movendo na mesma coluna
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds
      };

      const newBoardData = {
        ...boardData,
        columns: {
          ...boardData.columns,
          [newColumn.id]: newColumn
        }
      };

      setBoardData(newBoardData);
    } else {
      // Movendo entre colunas
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStartColumn = {
        ...startColumn,
        taskIds: startTaskIds
      };

      const endTaskIds = Array.from(endColumn.taskIds);
      endTaskIds.splice(destination.index, 0, draggableId);
      const newEndColumn = {
        ...endColumn,
        taskIds: endTaskIds
      };

      const newBoardData = {
        ...boardData,
        columns: {
          ...boardData.columns,
          [newStartColumn.id]: newStartColumn,
          [newEndColumn.id]: newEndColumn
        }
      };

      setBoardData(newBoardData);
    }
  };

  // Manipula o edição de uma tarefa
  const handleEditTask = (taskId) => {
    setActiveForm(null);
    setEditingTask(taskId);
  };

  // Enquanto carrega, mostra uma mensagem
  if (loading) {
    return React.createElement('div', null, 'Carregando...');
  }

  // Dialog para edição de tarefa
  const renderEditDialog = () => {
    if (!editingTask) return null;
    
    const task = boardData.tasks[editingTask];
    let columnId;
    
    // Encontra a coluna que contém a tarefa
    for (const [id, column] of Object.entries(boardData.columns)) {
      if (column.taskIds.includes(task.id)) {
        columnId = id;
        break;
      }
    }
    
    return React.createElement(
      'div',
      { 
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      },
      React.createElement(
        'div',
        { 
          style: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            width: '500px'
          }
        },
        React.createElement(
          'h2',
          { style: { marginBottom: '15px' } },
          'Editar Tarefa'
        ),
        React.createElement(TaskForm, {
          columnId: columnId,
          task: task,
          onSave: handleSaveTask,
          onCancel: () => setEditingTask(null)
        })
      )
    );
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      { className: 'app-header' },
      React.createElement('div', { className: 'logo' }, 'Kanban Board')
    ),
    React.createElement(
      DragDropContext,
      { onDragEnd: handleDragEnd },
      React.createElement(
        'div',
        { className: 'board-container' },
        boardData.columnOrder.map(columnId => {
          const column = boardData.columns[columnId];
          const tasks = column.taskIds.map(taskId => boardData.tasks[taskId]);
          
          return React.createElement(Column, {
            key: column.id,
            column: column,
            tasks: tasks,
            onAddTask: handleSaveTask,
            onEditTask: handleEditTask,
            activeForm: activeForm,
            setActiveForm: setActiveForm
          });
        })
      )
    ),
    renderEditDialog()
  );
};

// Renderiza o aplicativo React usando a nova API do React 18
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(React.createElement(App));