const { DragDropContext, Droppable, Draggable } = window.ReactBeautifulDnd;


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

// Componente para a barra de título customizada
const TitleBar = ({ darkMode }) => {
  // Manipular eventos de controle da janela
  const handleMinimize = () => {
    window.electronAPI.minimize();
  };
  
  const handleMaximize = () => {
    window.electronAPI.maximize();
  };
  
  const handleClose = () => {
    window.electronAPI.close();
  };

  // Formato atual de data e usuário - você pode ajustar conforme necessário
  const currentUser = 'Tester';
  
  // SVGs para os botões de controle
  const minimizeSvg = '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><rect height="1" width="10" y="4.5" x="0" /></svg>';
  const maximizeSvg = '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><rect height="8" width="8" y="1" x="1" fill="none" stroke="currentColor" stroke-width="1.1" /></svg>';
  const restoreSvg = '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><path d="M2.5,2v3.5h3.5v-3.5Z M4,0.5v1H1v3h1V1.5h3v-1Z" stroke="currentColor" fill="none" stroke-width="1.1"/></svg>';
  const closeSvg = '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><path d="M1,1 L9,9 M9,1 L1,9" stroke="currentColor" stroke-width="1.1" fill="none" /></svg>';
  const kanbanSvg = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5.5,2 C4.67,2 4,2.67 4,3.5 L4,20.5 C4,21.33 4.67,22 5.5,22 L18.5,22 C19.33,22 20,21.33 20,20.5 L20,3.5 C20,2.67 19.33,2 18.5,2 L5.5,2 Z M10,4 L14,4 L14,10 L10,10 L10,4 Z M10,12 L14,12 L14,20 L10,20 L10,12 Z M6,4 L8,4 L8,14 L6,14 L6,4 Z M16,4 L18,4 L18,8 L16,8 L16,4 Z M16,10 L18,10 L18,20 L16,20 L16,10 Z M6,16 L8,16 L8,20 L6,20 L6,16 Z" /></svg>';
  const userSvg = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12,4 C13.93,4 15.5,5.57 15.5,7.5 C15.5,9.43 13.93,11 12,11 C10.07,11 8.5,9.43 8.5,7.5 C8.5,5.57 10.07,4 12,4 Z M12,13 C16.42,13 20,14.79 20,17 L20,20 L4,20 L4,17 C4,14.79 7.58,13 12,13 Z" /></svg>';

  // Criar elemento para o SVG (método auxiliar para injetar HTML)
  const createSvgElement = (svgString) => {
    return {
      __html: svgString
    };
  };

  return React.createElement(
    'div',
    { className: 'custom-titlebar' },
    React.createElement(
      'div',
      { className: 'title-drag-area' },
      React.createElement('div', { 
        className: 'app-icon',
        dangerouslySetInnerHTML: createSvgElement(kanbanSvg)
      }),
      React.createElement('div', { className: 'window-title' }, 'Nanoban'),
      React.createElement(
        'div',
        { className: 'user-info' },
        React.createElement('span', { 
          dangerouslySetInnerHTML: createSvgElement(userSvg)
        }),
        currentUser
      )
    ),
    React.createElement(
      'div',
      { className: 'window-controls' },
      React.createElement(
        'button',
        { 
          className: 'control-button minimize',
          onClick: handleMinimize,
          title: 'Minimizar'
        },
        React.createElement('span', { 
          dangerouslySetInnerHTML: createSvgElement(minimizeSvg)
        })
      ),
      React.createElement(
        'button',
        { 
          className: 'control-button maximize',
          onClick: handleMaximize,
          title: 'Maximizar'
        },
        React.createElement('span', { 
          dangerouslySetInnerHTML: createSvgElement(maximizeSvg)
        })
      ),
      React.createElement(
        'button',
        { 
          className: 'control-button close',
          onClick: handleClose,
          title: 'Fechar'
        },
        React.createElement('span', { 
          dangerouslySetInnerHTML: createSvgElement(closeSvg)
        })
      )
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

// Componente do menu de opções de dados
const DataOptionsMenu = ({ onExport, onImport, onReset }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleClick = (action) => {
    action();
    setIsOpen(false);
  };

  return React.createElement(
    'div',
    { 
      className: 'data-options-container',
      onBlur: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }
    },
    React.createElement(
      'button',
      {
        className: `data-options-button ${isOpen ? 'active' : ''}`,
        onClick: () => setIsOpen(!isOpen)
      },
      '⚙️ Dados'
    ),
    isOpen && React.createElement(
      'div',
      { className: 'data-options-menu' },
      [
        {
          label: '📤 Exportar Dados',
          onClick: () => handleClick(onExport),
          className: 'menu-item'
        },
        {
          label: '📥 Importar Dados',
          onClick: () => handleClick(onImport),
          className: 'menu-item'
        },
        {
          label: '🗑️ Resetar Dados',
          onClick: () => handleClick(onReset),
          className: 'menu-item danger'
        }
      ].map((item, index) =>
        React.createElement(
          'button',
          {
            key: index,
            className: item.className,
            onClick: item.onClick
          },
          item.label
        )
      )
    )
  );
};

// Componente do diálogo de confirmação para reset
const ConfirmResetDialog = ({ onConfirm, onCancel }) => {
  return React.createElement(
    'div',
    { 
      className: 'dialog-overlay', 
      onClick: onCancel 
    },
    React.createElement(
      'div',
      { 
        className: 'dialog-content reset-dialog',
        onClick: e => e.stopPropagation()
      },
      React.createElement('h2', { className: 'dialog-title' }, 'Resetar Dados'),
      React.createElement(
        'p',
        null,
        'Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.'
      ),
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
          'Resetar Tudo'
        )
      )
    )
  );
};

// Componente para exibir notificações
const Notification = ({ message, type, onClose }) => {
  React.useEffect(() => {
    // Fechar automaticamente após 3 segundos
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return React.createElement(
    'div',
    { className: `notification ${type}` },
    message,
    React.createElement(
      'button',
      { className: 'close-notification', onClick: onClose },
      '×'
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

// Componente de cartão
const TaskCard = ({ task, index, onEditTask, onDeleteTask }) => {
  // Formatação de data e prioridade permanece igual
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  // Verificar se a data de vencimento passou
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    return taskDueDate < today;
  };

  // Manipulador para impedir propagação de clique
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteTask(task.id);
  };

  return React.createElement(
    Draggable,
    { draggableId: task.id, index: index },
    (provided, snapshot) => {
      return React.createElement(
        'div',
        {
          className: `task-card ${snapshot.isDragging ? 'dragging' : ''}`,
          ...provided.draggableProps,
          ...provided.dragHandleProps,
          ref: provided.innerRef,
          onClick: () => onEditTask(task.id)
        },
        React.createElement(
          'div',
          { className: 'task-header' },
          React.createElement('div', { className: 'task-title' }, task.title),
          React.createElement(
            'div',
            { className: 'task-actions' },
            React.createElement(
              'button',
              { 
                className: 'task-delete-btn',
                onClick: handleDeleteClick,
                title: 'Excluir tarefa'
              },
              '×'
            )
          )
        ),
        task.description && React.createElement('div', { className: 'task-description' }, task.description),
        React.createElement(
          'div',
          { className: 'task-meta' },
          task.priority && React.createElement(
            'span',
            { className: `priority-badge ${getPriorityClass(task.priority)}` },
            getPriorityLabel(task.priority)
          ),
          task.dueDate && React.createElement(
            'div',
            { className: `due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}` },
            `Vencimento: ${formatDate(task.dueDate)}${isOverdue(task.dueDate) ? ' (Atrasado)' : ''}`
          )
        )
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

// Componente de coluna atualizado
const Column = ({ column, tasks, onAddTask, onEditTask, onDeleteTask, onRenameColumn, onDeleteColumn, activeForm, setActiveForm }) => {
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
              onEditTask: onEditTask,
              onDeleteTask: onDeleteTask 
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

// Componente de diálogo de confirmação para exclusão de tarefa
const DeleteTaskDialog = ({ task, onConfirm, onCancel }) => {
  return React.createElement(
    'div',
    { 
      className: 'dialog-overlay', 
      onClick: onCancel 
    },
    React.createElement(
      'div',
      { 
        className: 'dialog-content delete-task-dialog',
        onClick: e => e.stopPropagation()
      },
      React.createElement('h2', null, 'Excluir Tarefa'),
      React.createElement(
        'p',
        null,
        `Tem certeza que deseja excluir a tarefa "${task.title}"?`
      ),
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

// Componente principal da aplicação
const App = () => {
  // 1. Estados
  const [darkMode, setDarkMode] = React.useState(false);
  const [boardData, setBoardData] = React.useState(null);
  const [notification, setNotification] = React.useState(null);
  const [isConfirmingReset, setIsConfirmingReset] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState('');
  const [currentUser, setCurrentUser] = React.useState('');
  const [activeForm, setActiveForm] = React.useState(null);
  const [editingTask, setEditingTask] = React.useState(null);
  const [deletingTask, setDeletingTask] = React.useState(null);
  const [deletingColumn, setDeletingColumn] = React.useState(null);

  // 2. Efeitos
  React.useEffect(() => {
    let mounted = true;
  
    const initialize = async () => {
      if (mounted) {
        try {
          await loadInitialData();
          await updateSystemInfo();
        } catch (error) {
          console.error('Erro na inicialização:', error);
        }
      }
    };
  
    initialize();
  
    const intervalId = setInterval(() => {
      if (mounted) {
        updateSystemInfo();
      }
    }, 60000);
  
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  React.useEffect(() => {
    const loadTheme = async () => {
      try {
        const themeData = await window.electronAPI.loadTheme();
        setDarkMode(themeData.darkMode);
        document.body.classList.toggle('dark-theme', themeData.darkMode);
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      }
    };
    
    loadTheme();
  }, []);

  // Efeito para salvar dados quando houver alterações
  React.useEffect(() => {
    if (boardData && !loading) {
      window.electronAPI.saveBoardData(boardData)
        .catch(error => console.error('Erro ao salvar dados:', error));
    }
  }, [boardData, loading]);

  // 3. Funções auxiliares
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.loadBoardData();
      
      // Verificar se os dados são válidos
      if (!data || !data.columns || !data.columnOrder || !data.tasks) {
        console.error('Dados inválidos recebidos:', data);
        // Criar estrutura inicial
        const initialData = {
          tasks: {},
          columns: {
            'column-1': {
              id: 'column-1',
              title: 'Backlog',
              taskIds: []
            },
            'column-2': {
              id: 'column-2',
              title: 'Em Andamento',
              taskIds: []
            },
            'column-3': {
              id: 'column-3',
              title: 'Concluído',
              taskIds: []
            }
          },
          columnOrder: ['column-1', 'column-2', 'column-3']
        };
        setBoardData(initialData);
      } else {
        setBoardData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showNotification(`Erro ao carregar dados: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateSystemInfo = async () => {
    try {
      const time = await window.electronAPI.getCurrentDateTime();
      const user = await window.electronAPI.getCurrentUser();
      setCurrentTime(time);
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao carregar informações do sistema:', error);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 4. Handlers de Dados (Export/Import/Reset)
  const handleExportData = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.exportBoard();
      showNotification(
        result.success ? 'Dados exportados com sucesso!' : result.message,
        result.success ? 'success' : 'error'
      );
    } catch (error) {
      showNotification(`Erro ao exportar dados: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.importBoard();
      if (result.success) {
        setBoardData(result.data);
        showNotification('Dados importados com sucesso!', 'success');
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification(`Erro ao importar dados: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = () => setIsConfirmingReset(true);

  const handleResetConfirm = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.resetBoard();
      if (result.success) {
        setBoardData(result.data);
        showNotification('Dados resetados com sucesso!', 'success');
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification(`Erro ao resetar dados: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      setIsConfirmingReset(false);
    }
  };

  // 5. Handlers de Tarefas
  const handleSaveTask = (columnId, task) => {
    const newBoardData = { ...boardData };
    if (!newBoardData.tasks[task.id]) {
      newBoardData.tasks[task.id] = task;
      newBoardData.columns[columnId].taskIds.push(task.id);
    } else {
      newBoardData.tasks[task.id] = task;
    }
    setBoardData(newBoardData);
    setActiveForm(null);
    setEditingTask(null);
  };

  const handleEditTask = (taskId) => {
    setActiveForm(null);
    setEditingTask(taskId);
  };

  const handleDeleteTaskStart = (taskId) => setDeletingTask(taskId);

  const handleDeleteTaskConfirm = () => {
    if (!deletingTask) return;
    
    const newBoardData = {...boardData};
    let foundColumnId = null;
    
    Object.keys(newBoardData.columns).forEach(columnId => {
      if (newBoardData.columns[columnId].taskIds.includes(deletingTask)) {
        foundColumnId = columnId;
      }
    });
    
    if (foundColumnId) {
      const column = newBoardData.columns[foundColumnId];
      const newTaskIds = column.taskIds.filter(id => id !== deletingTask);
      newBoardData.columns[foundColumnId] = {
        ...column,
        taskIds: newTaskIds
      };
      delete newBoardData.tasks[deletingTask];
      setBoardData(newBoardData);
    }
    setDeletingTask(null);
  };

  const handleDeleteTaskCancel = () => setDeletingTask(null);

  // 6. Handlers de Colunas
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

  const handleDeleteColumnStart = (columnId) => setDeletingColumn(columnId);

  const handleDeleteColumnConfirm = () => {
    if (!deletingColumn) return;
    
    const taskIdsToDelete = boardData.columns[deletingColumn].taskIds;
    const newTasks = { ...boardData.tasks };
    taskIdsToDelete.forEach(taskId => delete newTasks[taskId]);
    
    const newColumns = { ...boardData.columns };
    delete newColumns[deletingColumn];
    
    const newColumnOrder = boardData.columnOrder.filter(id => id !== deletingColumn);
    
    setBoardData({
      ...boardData,
      tasks: newTasks,
      columns: newColumns,
      columnOrder: newColumnOrder
    });
    setDeletingColumn(null);
  };

  const handleDeleteColumnCancel = () => setDeletingColumn(null);

  // 7. Handlers de DragAndDrop
  const handleDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }

    if (type === 'column') {
      const newColumnOrder = Array.from(boardData.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      setBoardData({
        ...boardData,
        columnOrder: newColumnOrder
      });
      return;
    }

    const startColumn = boardData.columns[source.droppableId];
    const endColumn = boardData.columns[destination.droppableId];

    if (startColumn === endColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds
      };

      setBoardData({
        ...boardData,
        columns: {
          ...boardData.columns,
          [newColumn.id]: newColumn
        }
      });
    } else {
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

      setBoardData({
        ...boardData,
        columns: {
          ...boardData.columns,
          [newStartColumn.id]: newStartColumn,
          [newEndColumn.id]: newEndColumn
        }
      });
    }
  };

  // 8. Handlers de UI
  const toggleTheme = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle('dark-theme', newDarkMode);
    try {
      await window.electronAPI.saveTheme(newDarkMode);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  // 9. Componentes de UI
  const LoadingSpinner = () => {
    return React.createElement(
      'div',
      { className: 'loading-container' },
      React.createElement(
        'div',
        { className: 'loading-spinner' },
        'Carregando...'
      )
    );
  };

  // 10. Renderizadores de Diálogos
  const renderEditDialog = () => {
    if (!editingTask) return null;
    
    const task = boardData.tasks[editingTask];
    let columnId = Object.entries(boardData.columns)
      .find(([_, column]) => column.taskIds.includes(task.id))?.[0];
    
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
        React.createElement('h2', { className: 'dialog-title' }, 'Editar Tarefa'),
        React.createElement(TaskForm, {
          columnId,
          task,
          onSave: handleSaveTask,
          onCancel: () => setEditingTask(null)
        })
      )
    );
  };

  const renderDeleteTaskDialog = () => {
    if (!deletingTask) return null;
    
    const task = boardData.tasks[deletingTask];
    if (!task) return null;
    
    return React.createElement(DeleteTaskDialog, {
      task,
      onConfirm: handleDeleteTaskConfirm,
      onCancel: handleDeleteTaskCancel
    });
  };

  const renderDeleteColumnDialog = () => {
    if (!deletingColumn) return null;
    
    const column = boardData.columns[deletingColumn];
    return React.createElement(DeleteColumnDialog, {
      column,
      onConfirm: handleDeleteColumnConfirm,
      onCancel: handleDeleteColumnCancel
    });
  };

  // 11. Renderização Principal
  if (loading) {
    return React.createElement(LoadingSpinner);
  }

  if (!boardData || !boardData.columns || !boardData.columnOrder || !boardData.tasks) {
    console.error('Dados inválidos:', boardData);
    return React.createElement(
      'div', 
      { className: 'error-message' }, 
      'Erro ao carregar dados. Por favor, reinicie o aplicativo.'
    );
  }

  const columnOrder = Array.isArray(boardData.columnOrder) ? boardData.columnOrder : [];

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(TitleBar, { darkMode }),
    React.createElement(
      'div',
      { className: 'app-header' },
      React.createElement(
        'div',
        { className: 'header-left' },
        React.createElement('div', { className: 'logo' }, 'Nanoban'),
        React.createElement(
          'div',
          { className: 'system-info' },
          currentUser && React.createElement('span', null, `Usuário: ${currentUser}, `),
          currentTime && React.createElement('span', null, `data: ${currentTime}`)
        )
      ),
      React.createElement(
        'div',
        { className: 'header-controls' },
        React.createElement(DataOptionsMenu, {
          onExport: handleExportData,
          onImport: handleImportData,
          onReset: handleResetData
        }),
        React.createElement('button', {
          className: 'theme-toggle',
          onClick: toggleTheme,
          title: darkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'
        }, darkMode ? '☀️' : '🌙')
      )
    ),
    notification && React.createElement(Notification, {
      message: notification.message,
      type: notification.type,
      onClose: () => setNotification(null)
    }),
    isConfirmingReset && React.createElement(ConfirmResetDialog, {
      onConfirm: handleResetConfirm,
      onCancel: () => setIsConfirmingReset(false)
    }),
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
          columnOrder.map((columnId, index) => {
            const column = boardData.columns[columnId];
            // Verificação de segurança para a coluna
            if (!column) {
              console.error(`Coluna não encontrada para o ID: ${columnId}`);
              return null;
            }

            const tasks = (column.taskIds || [])
              .map(taskId => boardData.tasks[taskId])
              .filter(task => task != null); // Filtrar tarefas indefinidas
            
            return React.createElement(
              Draggable,
              { 
                key: column.id, 
                draggableId: column.id, 
                index: index
              },
              (provided) => React.createElement(
                'div',
                { 
                  className: 'column-container',
                  ref: provided.innerRef,
                  ...provided.draggableProps,
                  ...provided.dragHandleProps
                },
                React.createElement(Column, {
                  column,
                  tasks,
                  onAddTask: handleSaveTask,
                  onEditTask: handleEditTask,
                  onDeleteTask: handleDeleteTaskStart,
                  onRenameColumn: handleRenameColumn,
                  onDeleteColumn: handleDeleteColumnStart,
                  activeForm,
                  setActiveForm
                })
              )
            );
          }).filter(Boolean), // Filtrar elementos nulos
          provided.placeholder,
          React.createElement(AddColumnButton, {
            onAddColumn: handleAddColumn
          })
        )
      )
    ),
    renderEditDialog(),
    renderDeleteColumnDialog(),
    renderDeleteTaskDialog()
  );
};

// Exportar o componente
window.App = App;

const styles = `
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: var(--bg-primary);
  }

  .loading-spinner {
    color: var(--text-color);
    font-size: 1.2em;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .loading-spinner::before {
    content: '';
    width: 24px;
    height: 24px;
    border: 3px solid var(--text-muted);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

const root = document.getElementById('root');
ReactDOM.render(React.createElement(App, null), root);