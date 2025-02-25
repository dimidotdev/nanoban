const { ipcRenderer } = require('electron');
const React = require('react');
const ReactDOM = require('react-dom/client');
const { DragDropContext, Droppable, Draggable } = require('react-beautiful-dnd');

// Componente para seleção de prioridade
const PrioritySelector = ({ priority, onChange }) => {
  return React.createElement(
    'div',
    { className: 'form-group' },
    React.createElement('label', null, 'Prioridade:'),
    React.createElement(
      'select',
      {
        value: priority || 'medium',
        onChange: (e) => onChange(e.target.value),
        className: 'priority-selector'
      },
      React.createElement('option', { value: 'high' }, 'Alta'),
      React.createElement('option', { value: 'medium' }, 'Média'),
      React.createElement('option', { value: 'low' }, 'Baixa')
    )
  );
};

// Componente para data de vencimento
const DatePicker = ({ dueDate, onChange }) => {
  return React.createElement(
    'div',
    { className: 'form-group' },
    React.createElement('label', null, 'Data de vencimento:'),
    React.createElement(
      'input',
      {
        type: 'date',
        value: dueDate || '',
        onChange: (e) => onChange(e.target.value),
        className: 'due-date-picker'
      }
    )
  );
};

// Componente de badge de prioridade
const PriorityBadge = ({ priority }) => {
  const priorityColors = {
    high: '#e53e3e',    // Vermelho para alta prioridade
    medium: '#ed8936',  // Laranja para média prioridade
    low: '#38a169'      // Verde para baixa prioridade
  };
  
  const priorityLabels = {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa'
  };
  
  return React.createElement(
    'div',
    { 
      className: 'priority-badge',
      style: {
        backgroundColor: priorityColors[priority] || priorityColors.medium,
        color: 'white',
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '11px',
        fontWeight: 'bold',
        display: 'inline-block',
        marginRight: '5px'
      }
    },
    priorityLabels[priority] || 'Média'
  );
};

// Componente para exibição de data formatada
const DueDate = ({ date }) => {
  if (!date) return null;
  
  const formattedDate = new Date(date).toLocaleDateString();
  const isOverdue = new Date(date) < new Date() && new Date(date).setHours(0,0,0,0) !== new Date().setHours(0,0,0,0);
  
  return React.createElement(
    'div',
    {
      className: 'due-date',
      style: {
        fontSize: '12px',
        color: isOverdue ? '#e53e3e' : '#718096',
        marginTop: '5px',
        display: 'flex',
        alignItems: 'center'
      }
    },
    React.createElement(
      'span',
      { 
        className: 'date-icon',
        style: { marginRight: '5px' }
      },
      '📅'
    ),
    formattedDate,
    isOverdue ? React.createElement(
      'span',
      { 
        style: { 
          color: '#e53e3e',
          marginLeft: '5px',
          fontWeight: 'bold'
        }
      },
      '(Atrasado)'
    ) : null
  );
};

// Componente de cartão de tarefa atualizado
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
        React.createElement(
          'div',
          { 
            className: 'task-header',
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '5px',
              alignItems: 'center'
            }
          },
          React.createElement('div', { className: 'task-title' }, task.title),
          task.priority ? React.createElement(PriorityBadge, { priority: task.priority }) : null
        ),
        React.createElement('div', { className: 'task-description' }, task.description),
        task.dueDate ? React.createElement(DueDate, { date: task.dueDate }) : null
      );
    }
  );
};

// Formulário de tarefa atualizado
const TaskForm = ({ columnId, task = null, onSave, onCancel }) => {
  const [title, setTitle] = React.useState(task ? task.title : '');
  const [description, setDescription] = React.useState(task ? task.description : '');
  const [priority, setPriority] = React.useState(task ? task.priority || 'medium' : 'medium');
  const [dueDate, setDueDate] = React.useState(task ? task.dueDate || '' : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(columnId, {
        id: task ? task.id : Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        priority: priority,
        dueDate: dueDate
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
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
    React.createElement(PrioritySelector, {
      priority: priority,
      onChange: setPriority
    }),
    React.createElement(DatePicker, {
      dueDate: dueDate,
      onChange: setDueDate
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
          justifyContent: 'center',
          zIndex: 1000
        }
      },
      React.createElement(
        'div',
        { 
          style: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            width: '500px',
            maxWidth: '90%'
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
root.render(React.createElement(App));v