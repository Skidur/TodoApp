// Função para atualizar o botão de modo escuro/claro
function updateDarkModeButton(isDarkMode) {
    var $toggleButton = $("#toggleDarkMode");
    if (isDarkMode) {
        $toggleButton.html('<i class="fas fa-sun"></i> Modo Claro');
        $toggleButton.css({
            "background": "linear-gradient(45deg, #ffcc00, #e6b800)",
            "color": "#ffffff"
        });
    } else {
        $toggleButton.html('<i class="fas fa-moon"></i> Modo Escuro');
        $toggleButton.css({
            "background": "linear-gradient(45deg, #1e1e1e, #2d2d2d)",
            "color": "#ffffff"
        });
    }
}

// Função para alternar entre modo claro e escuro
function toggleDarkMode() {
    console.log('Clicou no botão Modo Escuro');
    var $body = $("body");
    var isDarkMode = !$body.hasClass("dark-mode");
    $body.removeClass("light-mode dark-mode").addClass(isDarkMode ? "dark-mode" : "light-mode");
    console.log("Classe do body após toggle:", $body.attr("class") || "Nenhuma classe");
    updateDarkModeButton(isDarkMode);
    localStorage.setItem("darkMode", isDarkMode);
    document.cookie = `darkMode=${isDarkMode}; path=/`;
    console.log('Modo alterado para:', isDarkMode ? 'Escuro' : 'Claro');
}

// Função para inicializar o modo escuro
function initializeDarkMode() {
    var isDarkMode = $("body").hasClass("dark-mode");
    console.log("Estado inicial do body (definido pelo servidor):", $("body").attr("class") || "Nenhuma classe");
    updateDarkModeButton(isDarkMode);
}

// Variável global para armazenar os intervalos dos timers
let taskTimers = {};

// Função para formatar o tempo em HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Função para atualizar o timer de uma tarefa em tempo real
function startTimerUpdate(taskId, initialTimeSpent) {
    if (taskTimers[taskId]) clearInterval(taskTimers[taskId]); // Limpa intervalo existente
    const $timer = $(`.task-timer[data-task-id='${taskId}']`);
    let timeSpent = initialTimeSpent || parseFloat($timer.data('time-spent')) || 0;
    taskTimers[taskId] = setInterval(() => {
        timeSpent += 1; // Incrementa 1 segundo
        $timer.text(formatTime(timeSpent));
        $timer.data('time-spent', timeSpent); // Atualiza o valor no elemento
    }, 1000); // Atualiza a cada 1 segundo
}

// Função para parar o timer de uma tarefa
function stopTimerUpdate(taskId) {
    if (taskTimers[taskId]) {
        clearInterval(taskTimers[taskId]);
        delete taskTimers[taskId];
    }
}

// Função para atualizar o status da tarefa na UI
function updateTaskStatus(taskId, status, timeSpent) {
    const oldRow = $(`.task-status[data-task-id='${taskId}']`).closest('tr');
    const taskName = oldRow.find('td:first').text();
    console.log('Atualizando tarefa ID:', taskId, 'Nome:', taskName, 'Status:', status, 'Tempo:', timeSpent);
    oldRow.remove();

    if (status === "Completed") {
        stopTimerUpdate(taskId); // Para o timer ao completar
        const row = `
            <tr>
                <td>${taskName}</td>
                <td class="task-timer" data-task-id="${taskId}" data-time-spent="${timeSpent || 0}" data-start-time="">${formatTime(timeSpent || 0)}</td>
                <td>
                    <button class="btn btn-danger deleteTask" data-task-id="${taskId}" aria-label="Excluir Tarefa">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            </tr>
        `;
        $('#completedTaskTableBody').append(row);
    } else {
        const row = `
            <tr>
                <td>${taskName}</td>
                <td class="task-status" data-task-id="${taskId}" data-status="${status}">
                    ${status === "InProgress" ? "Em andamento" : status === "Paused" ? "Pausada" : "Não Iniciada"}
                </td>
                <td class="task-timer" data-task-id="${taskId}" data-time-spent="${timeSpent || 0}" data-start-time="">${formatTime(timeSpent || 0)}</td>
                <td>
                    ${status === "NotStarted" ? `<button id="startBtn-${taskId}" class="btn btn-success startTimer" data-task-id="${taskId}" aria-label="Iniciar Tarefa"><i class="fas fa-play"></i> Iniciar</button>` : ''}
                    ${status === "InProgress" ? `<button id="pauseBtn-${taskId}" class="btn btn-warning stopTimer" data-task-id="${taskId}" aria-label="Pausar Tarefa"><i class="fas fa-pause"></i> Pausar</button><button id="completeBtn-${taskId}" class="btn btn-info completeTask" data-task-id="${taskId}" aria-label="Finalizar Tarefa"><i class="fas fa-check"></i> Finalizar</button>` : ''}
                    ${status === "Paused" ? `<button id="resumeBtn-${taskId}" class="btn btn-success resumeTimer" data-task-id="${taskId}" aria-label="Retomar Tarefa"><i class="fas fa-play"></i> Retomar</button><button id="completeBtn-${taskId}" class="btn btn-info completeTask" data-task-id="${taskId}" aria-label="Finalizar Tarefa"><i class="fas fa-check"></i> Finalizar</button>` : ''}
                    <button class="btn btn-danger deleteTask" data-task-id="${taskId}" aria-label="Excluir Tarefa">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            </tr>
        `;
        $('#taskTableBody').append(row);
        if (status === "InProgress") {
            startTimerUpdate(taskId, timeSpent); // Inicia o timer em tempo real
        } else {
            stopTimerUpdate(taskId); // Para o timer se não estiver em andamento
        }
    }
    // Atualiza o estado das tabelas após a mudança
    updateTableState();
}

// Funções de controle de tarefas
function startTaskTimer(taskId) {
    $.ajax({
        url: `/Todo/StartTimer`,
        type: "POST",
        data: { id: taskId },
        success: function(response) {
            if (response.success) {
                updateTaskStatus(taskId, response.status, response.timeSpent);
            } else {
                Swal.fire("Erro", response.error || "Erro ao iniciar a tarefa", "error");
            }
        },
        error: function(xhr) {
            Swal.fire("Erro", "Falha ao comunicar com o servidor", "error");
            console.error("Erro no StartTimer:", xhr.status, xhr.responseText);
        }
    });
}

function stopTaskTimer(taskId) {
    $.ajax({
        url: `/Todo/PauseTimer`,
        type: "POST",
        data: { id: taskId },
        success: function(response) {
            if (response.success) {
                updateTaskStatus(taskId, response.status, response.timeSpent);
            } else {
                Swal.fire("Erro", response.error || "Erro ao pausar a tarefa", "error");
            }
        },
        error: function(xhr) {
            Swal.fire("Erro", "Falha ao comunicar com o servidor", "error");
            console.error("Erro no PauseTimer:", xhr.status, xhr.responseText);
        }
    });
}

function resumeTaskTimer(taskId) {
    $.ajax({
        url: `/Todo/ResumeTimer`,
        type: "POST",
        data: { id: taskId },
        success: function(response) {
            if (response.success) {
                updateTaskStatus(taskId, response.status, response.timeSpent);
            } else {
                Swal.fire("Erro", response.error || "Erro ao retomar a tarefa", "error");
            }
        },
        error: function(xhr) {
            Swal.fire("Erro", "Falha ao comunicar com o servidor", "error");
            console.error("Erro no ResumeTimer:", xhr.status, xhr.responseText);
        }
    });
}

function completeTask(taskId) {
    Swal.fire({
        title: "Confirmar conclusão",
        text: "Tem certeza que deseja marcar esta tarefa como concluída?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, concluir",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/Todo/CompleteTask`,
                type: "POST",
                data: { id: taskId },
                success: function(response) {
                    if (response.success) {
                        updateTaskStatus(taskId, response.status, response.timeSpent);
                        Swal.fire("Sucesso", "Tarefa concluída com sucesso!", "success");
                    } else {
                        Swal.fire("Erro", response.error || "Erro ao concluir a tarefa", "error");
                    }
                },
                error: function(xhr) {
                    Swal.fire("Erro", "Falha ao comunicar com o servidor", "error");
                    console.error("Erro no CompleteTask:", xhr.status, xhr.responseText);
                }
            });
        }
    });
}

function deleteTask(taskId) {
    Swal.fire({
        title: "Confirmar exclusão",
        text: "Tem certeza que deseja excluir esta tarefa?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/Todo/Delete`,
                type: "POST",
                data: { id: taskId },
                success: function(response) {
                    if (response.success) {
                        $(`tr:has(.task-timer[data-task-id='${taskId}'])`).remove();
                        Swal.fire("Sucesso", "Tarefa excluída com sucesso!", "success");
                        // Dispara evento personalizado para atualizar o estado das tabelas
                        $(document).trigger('taskRemoved');
                    }
                },
                statusCode: {
                    400: function(xhr) {
                        let response = JSON.parse(xhr.responseText);
                        let errorMessage = response.error || "Erro ao excluir a tarefa";
                        if (errorMessage === "Não é possível excluir uma tarefa em andamento") {
                            errorMessage = "Não é possível excluir uma tarefa em andamento. Pause ou finalize a tarefa para prosseguir com a exclusão.";
                        }
                        Swal.fire("Erro", errorMessage, "error");
                    }
                },
                error: function(xhr) {
                    if (xhr.status !== 400 && xhr.status !== 404) {
                        console.error("Erro no Delete:", xhr.status, xhr.responseText);
                        Swal.fire("Erro", "Falha ao comunicar com o servidor. Verifique sua conexão ou tente novamente mais tarde.", "error");
                    }
                }
            });
        }
    });
}

// Função para atualizar o estado das tabelas
function updateTableState() {
    // Seleciona as duas tabelas (Tarefas Ativas e Tarefas Concluídas)
    const tables = document.querySelectorAll('.table');

    tables.forEach(table => {
        // Verifica se a tabela tem linhas de dados (exclui o cabeçalho)
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) {
            // Tabela vazia
            table.classList.remove('table-filled');
            table.classList.add('table-empty');
        } else {
            // Tabela com tarefas
            table.classList.remove('table-empty');
            table.classList.add('table-filled');
        }
    });
}

// Configuração das partículas como "poeira cósmica"
function initializeParticles() {
    particlesJS("particles-js", {
        "particles": {
            "number": {
                "value": 150, // Quantidade de partículas (poeira)
                "density": {
                    "enable": true,
                    "value_area": 800 // Densidade da área
                }
            },
            "color": {
                "value": "#b3e5fc" // Cor inicial (azul claro para modo claro)
            },
            "shape": {
                "type": "circle" // Formato circular para parecer poeira
            },
            "opacity": {
                "value": 0.5, // Opacidade baixa para efeito sutil
                "random": true, // Variação na opacidade
                "anim": {
                    "enable": true,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 2, // Tamanho pequeno para poeira
                "random": true, // Variação no tamanho
                "anim": {
                    "enable": true,
                    "speed": 2,
                    "size_min": 0.5,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": false // Sem linhas conectando as partículas
            },
            "move": {
                "enable": true,
                "speed": 0.5, // Movimento lento para simular flutuação
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": { "enable": false }, // Sem interação ao passar o mouse
                "onclick": { "enable": false }  // Sem interação ao clicar
            }
        },
        "retina_detect": true // Suporte para telas de alta resolução
    });

    // Função para atualizar as cores das partículas com base no modo
    function updateParticles() {
        const isDarkMode = $("body").hasClass("dark-mode");
        const particleColor = isDarkMode ? "#ffffff" : "#b3e5fc"; // Branco para escuro, azul claro para claro
        if (window.pJSDom && window.pJSDom[0]) {
            window.pJSDom[0].pJS.particles.color.value = particleColor;
            window.pJSDom[0].pJS.fn.particlesRefresh();
        }
    }

    // Atualiza as partículas ao mudar o modo
    $("#toggleDarkMode").on("click", function() {
        setTimeout(updateParticles, 100); // Pequeno atraso para garantir que o modo mudou
    });

    // Inicializa as partículas com a cor correta
    updateParticles();
}

// Função para submeter o nome na página Welcome
function submitName() {
    var userName = document.getElementById("userName").value.trim(); // Remove espaços em branco

    if (!userName) {
        // Campo está vazio, exibe o pop-up de erro
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Por favor, preencha o campo de nome!',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal2-higher-zindex',
                confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false, // Permite estilização personalizada via CSS
            backdrop: true,
            allowOutsideClick: false // Impede fechar clicando fora
        });
    } else if (!/^[A-Za-zÀ-ÿ\s]{2,50}$/.test(userName)) {
        // Nome não atende ao padrão, exibe o pop-up de erro
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Por favor, insira um nome válido (2 a 50 caracteres, apenas letras e espaços).',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal2-higher-zindex',
                confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false,
            backdrop: true,
            allowOutsideClick: false
        });
    } else {
        // Campo preenchido e válido, prossegue com o redirecionamento
        localStorage.setItem("username", userName); // Salva o nome no localStorage
        window.location.href = "/Todo/Index?userName=" + encodeURIComponent(userName);
    }
}

// Inicializa o script
$(document).ready(function () {
    if (typeof $ === 'undefined') {
        console.error('jQuery não foi carregado corretamente. Verifique os links de script.');
        return;
    }
    console.log('site.js: Scripts carregados.');
    console.log('Página atual:', window.location.pathname);

    // Adiciona a classe js-loaded após o carregamento
    $('body').addClass('js-loaded');

    // Verifica se o nome existe no localStorage e redireciona se necessário
    var username = localStorage.getItem("username");
    var currentPath = window.location.pathname;
    if (!username || !/^[A-Za-zÀ-ÿ\s]{2,50}$/.test(username)) {
        if (currentPath !== window.homeUrl && currentPath !== '/Home/Error') {
            console.log("Nome de usuário não encontrado ou inválido, redirecionando para Welcome.");
            window.location.href = window.homeUrl;
            return;
        }
    } else {
        console.log("Nome de usuário válido encontrado no localStorage:", username);
    }

    // Inicializa o modo escuro
    initializeDarkMode();

    // Vinculação de eventos para modo escuro
    $("#toggleDarkMode").on("click", toggleDarkMode);

    // Vinculação de eventos para tarefas (apenas na página de tarefas)
    if (currentPath === window.todoUrl) {
        $(document).on("click", ".startTimer", function (e) {
            e.preventDefault();
            var taskId = $(this).data("task-id");
            startTaskTimer(taskId);
        });

        $(document).on("click", ".stopTimer", function (e) {
            e.preventDefault();
            var taskId = $(this).data("task-id");
            stopTaskTimer(taskId);
        });

        $(document).on("click", ".resumeTimer", function (e) {
            e.preventDefault();
            var taskId = $(this).data("task-id");
            resumeTaskTimer(taskId);
        });

        $(document).on("click", ".completeTask", function (e) {
            e.preventDefault();
            var taskId = $(this).data("task-id");
            completeTask(taskId);
        });

        $(document).on("click", ".deleteTask", function (e) {
            e.preventDefault();
            var taskId = $(this).data("task-id");
            deleteTask(taskId);
        });

        // Lógica de abertura do modal
        $("#addTaskButton").on('click', function () {
            console.log('Abrindo modal de adicionar tarefa');
            $('#addTaskModal').modal({ backdrop: false }); // Desativa o backdrop padrão do Bootstrap
            $('#addTaskModal').modal('show');
        });

        // Aplica o efeito de blur ao abrir o modal
        $('#addTaskModal').on('shown.bs.modal', function () {
            $('.content-wrapper').addClass('modal-blur');
            $(this).find('input:first').focus();
            console.log('Modal aberto, focando no input');
        });

        // Remove o efeito de blur ao fechar o modal
        $('#addTaskModal').on('hidden.bs.modal', function () {
            $('.content-wrapper').removeClass('modal-blur');
            $('body').removeClass('modal-open');
            console.log('Modal fechado, limpando estado');
        });

        // Lógica de adição de tarefa
        $('#addTaskForm').on('submit', function (e) {
            e.preventDefault();
            var taskName = $('#taskName').val().trim();
            if (!taskName) {
                $('#addTaskModal').modal('hide');
                Swal.fire({
                    title: "Erro",
                    text: "Por favor, insira um nome para a tarefa.",
                    icon: "error",
                    customClass: { popup: 'swal2-higher-zindex' }
                });
                return;
            }
            $.ajax({
                url: '/Todo/Create',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ name: taskName, status: "NotStarted" }),
                success: function(result) {
                    if (result.success) {
                        var newRow = `
                            <tr>
                                <td>${taskName}</td>
                                <td class="task-status" data-task-id="${result.taskId}" data-status="NotStarted">Não Iniciada</td>
                                <td class="task-timer" data-task-id="${result.taskId}" data-time-spent="0" data-start-time="">00:00:00</td>
                                <td>
                                    <button id="startBtn-${result.taskId}" class="btn btn-success startTimer" data-task-id="${result.taskId}" aria-label="Iniciar Tarefa">
                                        <i class="fas fa-play"></i> Iniciar
                                    </button>
                                    <button id="pauseBtn-${result.taskId}" class="btn btn-warning stopTimer" data-task-id="${result.taskId}" style="display: none;" aria-label="Pausar Tarefa">
                                        <i class="fas fa-pause"></i> Pausar
                                    </button>
                                    <button id="resumeBtn-${result.taskId}" class="btn btn-success resumeTimer" data-task-id="${result.taskId}" style="display: none;" aria-label="Retomar Tarefa">
                                        <i class="fas fa-play"></i> Retomar
                                    </button>
                                    <button id="completeBtn-${result.taskId}" class="btn btn-info completeTask" data-task-id="${result.taskId}" style="display: none;" aria-label="Finalizar Tarefa">
                                        <i class="fas fa-check"></i> Finalizar
                                    </button>
                                    <button class="btn btn-danger deleteTask" data-task-id="${result.taskId}" aria-label="Excluir Tarefa">
                                        <i class="fas fa-trash"></i> Excluir
                                    </button>
                                </td>
                            </tr>
                        `;
                        $("#taskTableBody").append(newRow);
                        $('#taskName').val('');
                        $('#addTaskModal').modal('hide');
                        Swal.fire("Sucesso", "Tarefa adicionada com sucesso!", "success");
                        // Dispara evento personalizado para atualizar o estado das tabelas
                        $(document).trigger('taskAdded');
                    } else {
                        $('#addTaskModal').modal('hide');
                        Swal.fire({
                            title: "Erro",
                            text: result.error || "Erro ao adicionar a tarefa.",
                            icon: "error",
                            customClass: { popup: 'swal2-higher-zindex' }
                        });
                    }
                },
                error: function(xhr) {
                    $('#addTaskModal').modal('hide');
                    Swal.fire({
                        title: "Erro",
                        text: "Falha ao comunicar com o servidor. Verifique o console.",
                        icon: "error",
                        customClass: { popup: 'swal2-higher-zindex' }
                    });
                    console.error("Erro AJAX:", xhr.status, xhr.responseText);
                }
            });
        });

        // Inicializa o estado das tabelas ao carregar a página
        updateTableState();

        // Vincula os eventos personalizados para atualizar o estado das tabelas
        $(document).on('taskAdded', updateTableState);
        $(document).on('taskRemoved', updateTableState);
    }

    // Inicializa as partículas
    initializeParticles();
});