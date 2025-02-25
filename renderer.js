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

const ThemeToggle = ({ darkMode, toggleTheme }) => {
  return React.createElement(
    'button',
    {
      className: 'theme-toggle',
      onClick: toggleTheme,
      title: darkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro',
      'aria-label': darkMode ? 'Tema claro' : 'Tema escuro'
    },
    darkMode ? '☀️' : '🌙'
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
const Column = ({ column, tasks, onAddTask, onEditTask, onRenameColumn, onDeleteColumn, activeForm, setActiveForm }) => {
  return React.createElement(
    'div',
    { className: 'column' },
    React.createElement(ColumnHeader, {
      column: column,
      onRename: onRenameColumn,
      onDelete: onDeleteColumn
    }),
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

// Componente para cabeçalho da coluna editável
const ColumnHeader = ({ column, onRename, onDelete }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(column.title);
  const inputRef = React.useRef(null);

  // Foca no input quando o modo de edição é ativado
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onRename(column.id, title.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setTitle(column.title);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (title.trim()) {
      onRename(column.id, title.trim());
    } else {
      setTitle(column.title);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return React.createElement(
      'div',
      { className: 'column-header editing' },
      React.createElement(
        'form',
        { onSubmit: handleSubmit },
        React.createElement('input', {
          ref: inputRef,
          type: 'text',
          value: title,
          onChange: (e) => setTitle(e.target.value),
          onBlur: handleBlur,
          onKeyDown: handleKeyDown,
          className: 'column-title-input'
        })
      )
    );
  }

  return React.createElement(
    'div',
    { className: 'column-header' },
    React.createElement(
      'div',
      { 
        className: 'column-title',
        onDoubleClick: () => setIsEditing(true)
      },
      column.title
    ),
    React.createElement(
      'button',
      { 
        className: 'column-delete-btn',
        onClick: () => onDelete(column.id),
        title: 'Excluir coluna'
      },
      '×'
    )
  );
};

// Componente para adicionar nova coluna
const AddColumnButton = ({ onAddColumn }) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAddColumn(title.trim());
      setTitle('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  if (isAdding) {
    return React.createElement(
      'div',
      { className: 'add-column-form' },
      React.createElement(
        'form',
        { onSubmit: handleSubmit },
        React.createElement('input', {
          ref: inputRef,
          type: 'text',
          value: title,
          onChange: (e) => setTitle(e.target.value),
          placeholder: 'Insira o título da coluna...',
          className: 'add-column-input'
        }),
        React.createElement(
          'div',
          { className: 'add-column-buttons' },
          React.createElement(
            'button',
            { type: 'submit', className: 'add-column-submit' },
            'Adicionar'
          ),
          React.createElement(
            'button',
            { type: 'button', className: 'add-column-cancel', onClick: handleCancel },
            'Cancelar'
          )
        )
      )
    );
  }

  return React.createElement(
    'div',
    { className: 'add-column-button-container' },
    React.createElement(
      'button',
      { className: 'add-column-button', onClick: () => setIsAdding(true) },
      '+ Adicionar Coluna'
    )
  );
};

// Componente de diálogo de confirmação para exclusão de coluna
const DeleteColumnDialog = ({ column, onConfirm, onCancel }) => {
  const taskCount = column.taskIds.length;

  return React.createElement(
    'div',
    { 
      className: 'dialog-overlay', 
      onClick: onCancel 
    },
    React.createElement(
      'div',
      { 
        className: 'dialog-content delete-column-dialog',
        onClick: e => e.stopPropagation()
      },
      React.createElement('h2', null, 'Excluir Coluna'),
      React.createElement(
        'p',
        null,
        `Tem certeza que deseja excluir a coluna "${column.title}"?`
      ),
      taskCount > 0 ? React.createElement(
        'p',
        { className: 'warning-text' },
        `Esta coluna contém ${taskCount} tarefa${taskCount !== 1 ? 's' : ''}. Todas as tarefas serão excluídas permanentemente.`
      ) : null,
      React.createElement(
        'div',
        { className: 'dialog-buttons' },
        React.createElement(
          'button',
          { className: 'cancel-btn', onClick: onCancel },
          'Cancelar'
        ),
        React.createElement(
          'button',
          { className: 'delete-btn', onClick: onConfirm },
          'Excluir'
        )
      )
    )
  );
};

// Componente principal do aplicativo Kanban com gerenciamento de colunas
const App = () => {
  const [boardData, setBoardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [activeForm, setActiveForm] = React.useState(null);
  const [editingTask, setEditingTask] = React.useState(null);
  const [darkMode, setDarkMode] = React.useState(false);
  const [deletingColumn, setDeletingColumn] = React.useState(null);

  // Carrega os dados ao iniciar
  React.useEffect(() => {
    const loadData = async () => {
      const data = await ipcRenderer.invoke('load-board');
      setBoardData(data);
      
      // Carregar preferência de tema
      const themePreference = localStorage.getItem('darkMode');
      if (themePreference !== null) {
        const isDark = themePreference === 'true';
        setDarkMode(isDark);
        if (isDark) {
          document.body.classList.add('dark-theme');
        }
      }
      
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

  // Função para alternar o tema
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('darkMode', newDarkMode);
  };

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
    const { destination, source, draggableId, type } = result;

    // Se não houver destino ou for o mesmo local, não faz nada
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }

    // Se for drag and drop de uma coluna
    if (type === 'column') {
      const newColumnOrder = Array.from(boardData.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newBoardData = {
        ...boardData,
        columnOrder: newColumnOrder
      };

      setBoardData(newBoardData);
      return;
    }

    // Se for drag and drop de uma tarefa
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

  // Manipula a edição de uma tarefa
  const handleEditTask = (taskId) => {
    setActiveForm(null);
    setEditingTask(taskId);
  };

  // Adiciona uma nova coluna
  const handleAddColumn = (title) => {
    const newColumnId = `column-${Date.now()}`;
    const newBoardData = {
      ...boardData,
      columns: {
        ...boardData.columns,
        [newColumnId]: {
          id: newColumnId,
          title: title,
          taskIds: []
        }
      },
      columnOrder: [...boardData.columnOrder, newColumnId]
    };
    
    setBoardData(newBoardData);
  };

  // Renomeia uma coluna
  const handleRenameColumn = (columnId, newTitle) => {
    if (boardData.columns[columnId].title === newTitle) return;
    
    const newBoardData = {
      ...boardData,
      columns: {
        ...boardData.columns,
        [columnId]: {
          ...boardData.columns[columnId],
          title: newTitle
        }
      }
    };
    
    setBoardData(newBoardData);
  };

  // Inicia o processo de exclusão de coluna
  const handleDeleteColumnStart = (columnId) => {
    setDeletingColumn(columnId);
  };

  // Confirma a exclusão da coluna
  const handleDeleteColumnConfirm = () => {
    if (!deletingColumn) return;
    
    const columnId = deletingColumn;
    const taskIdsToDelete = boardData.columns[columnId].taskIds;
    
    // Cria um novo objeto de tarefas sem as tarefas da coluna excluída
    const newTasks = { ...boardData.tasks };
    taskIdsToDelete.forEach(taskId => {
      delete newTasks[taskId];
    });
    
    // Cria um novo objeto de colunas sem a coluna excluída
    const newColumns = { ...boardData.columns };
    delete newColumns[columnId];
    
    // Atualiza a ordem de colunas
    const newColumnOrder = boardData.columnOrder.filter(id => id !== columnId);
    
    const newBoardData = {
      ...boardData,
      tasks: newTasks,
      columns: newColumns,
      columnOrder: newColumnOrder
    };
    
    setBoardData(newBoardData);
    setDeletingColumn(null);
  };

  // Cancela a exclusão da coluna
  const handleDeleteColumnCancel = () => {
    setDeletingColumn(null);
  };

  // Enquanto carrega, mostra uma mensagem
  if (loading) {
    return React.createElement('div', { className: 'loading' }, 'Carregando...');
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
        className: 'dialog-overlay',
        onClick: () => setEditingTask(null)
      },
      React.createElement(
        'div',
        { 
          className: 'dialog-content',
          onClick: e => e.stopPropagation()
        },
        React.createElement(
          'h2',
          { className: 'dialog-title' },
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

  // Dialog para confirmação de exclusão de coluna
  const renderDeleteColumnDialog = () => {
    if (!deletingColumn) return null;
    
    const column = boardData.columns[deletingColumn];
    
    return React.createElement(DeleteColumnDialog, {
      column: column,
      onConfirm: handleDeleteColumnConfirm,
      onCancel: handleDeleteColumnCancel
    });
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      { className: 'app-header' },
      React.createElement('div', { className: 'logo' }, 'Kanban Board'),
      React.createElement(ThemeToggle, { darkMode: darkMode, toggleTheme: toggleTheme })
    ),
    React.createElement(
      DragDropContext,
      { onDragEnd: handleDragEnd },
      React.createElement(
        Droppable,
        { droppableId: 'board', direction: 'horizontal', type: 'column' },
        (provided) => React.createElement(
          'div',
          { 
            className: 'board-container',
            ref: provided.innerRef,
            ...provided.droppableProps
          },
          boardData.columnOrder.map((columnId, index) => {
            const column = boardData.columns[columnId];
            const tasks = column.taskIds.map(taskId => boardData.tasks[taskId]);
            
            return React.createElement(
              Draggable,
              { key: column.id, draggableId: column.id, index: index, type: 'column' },
              (provided) => React.createElement(
                'div',
                { 
                  className: 'column-container',
                  ref: provided.innerRef,
                  ...provided.draggableProps,
                  ...provided.dragHandleProps
                },
                React.createElement(Column, {
                  column: column,
                  tasks: tasks,
                  onAddTask: handleSaveTask,
                  onEditTask: handleEditTask,
                  onRenameColumn: handleRenameColumn,
                  onDeleteColumn: handleDeleteColumnStart,
                  activeForm: activeForm,
                  setActiveForm: setActiveForm
                })
              )
            );
          }),
          provided.placeholder,
          React.createElement(AddColumnButton, {
            onAddColumn: handleAddColumn
          })
        )
      )
    ),
    renderEditDialog(),
    renderDeleteColumnDialog()
  );
};

// Renderiza o aplicativo React usando a nova API do React 18
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(React.createElement(App));v