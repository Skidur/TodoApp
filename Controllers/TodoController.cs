using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApp.Data;
using TodoApp.Models;
using System;
using System.Threading.Tasks;

namespace TodoApp.Controllers
{
    public class TodoController : Controller
    {
        private readonly AppDbContext _context; // Contexto do banco para tarefas
        private readonly ILogger<TodoController> _logger; // Logger para monitoramento

        // Construtor com injeção de dependência
        public TodoController(AppDbContext context, ILogger<TodoController> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context)); // Valida o contexto
            _logger = logger; // Armazena o logger
        }

        // Configura variáveis comuns para as views
        private void SetCommonViewBag()
        {
            ViewBag.popperjs = "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"; // Define URL do Popper.js
            ViewBag.IsDarkMode = Request.Cookies["darkMode"] == "true" || false; // Verifica o cookie de modo escuro
        }

        // Carrega a lista de tarefas
        public async Task<IActionResult> Index()
        {
            SetCommonViewBag(); // Configura variáveis comuns
            var tasks = await _context.TaskItems.ToListAsync(); // Busca todas as tarefas do banco
            _logger.LogInformation("Lista de tarefas carregada com sucesso."); // Loga o sucesso
            return View(tasks); // Retorna a view com a lista de tarefas
        }

        // Modelo para receber os dados do JSON
        public class TaskCreateModel
        {
            public string? Name { get; set; }
            public string? Status { get; set; }
        }

        // Adiciona uma nova tarefa
        [HttpPost]
        [Route("Todo/Create")]
        public async Task<IActionResult> Create([FromBody] TaskCreateModel taskData)
        {
            if (taskData == null || string.IsNullOrWhiteSpace(taskData.Name)) // Verifica se o nome está vazio ou nulo
            {
                return BadRequest(new { success = false, error = "O nome da tarefa não pode ser vazio" }); // Retorna erro 400
            }
            if (taskData.Name.Length > 100) // Verifica o limite de caracteres
            {
                return BadRequest(new { success = false, error = "O nome da tarefa deve ter no máximo 100 caracteres" }); // Retorna erro 400
            }

            try
            {
                var task = new TaskItem
                {
                    Name = taskData.Name,
                    Status = taskData.Status == "NotStarted" ? TaskItemStatus.NotStarted : TaskItemStatus.NotStarted, // Garante NotStarted
                    TimeSpent = TimeSpan.Zero,
                    StartTime = null
                };
                _context.TaskItems.Add(task); // Adiciona ao contexto
                await _context.SaveChangesAsync(); // Salva no banco
                _logger.LogInformation("Tarefa #{Id} adicionada: {Name}", task.Id, task.Name); // Loga o sucesso
                return Ok(new { success = true, taskId = task.Id, taskName = task.Name }); // Retorna JSON com sucesso
            }
            catch (Exception ex) // Captura erros
            {
                _logger.LogError(ex, "Erro ao adicionar tarefa: {TaskName}", taskData.Name); // Loga o erro
                return StatusCode(500, new { success = false, error = "Erro interno ao adicionar tarefa: " + ex.Message }); // Retorna erro 500
            }
        }

        // Inicia o timer de uma tarefa
        [HttpPost]
        public async Task<IActionResult> StartTimer(int id)
        {
            var task = await _context.TaskItems.FindAsync(id); // Busca a tarefa pelo ID
            if (task == null) // Verifica se a tarefa existe
            {
                return NotFound(new { success = false, error = "Tarefa não encontrada" }); // Retorna erro 404
            }

            try
            {
                task.StartTimer(); // Inicia o timer da tarefa
                await _context.SaveChangesAsync(); // Salva as alterações no banco
                _logger.LogInformation("Timer iniciado para tarefa #{Id}", id); // Loga o sucesso
                return Json(new { success = true, status = task.Status.ToString(), timeSpent = task.TimeSpent.TotalSeconds }); // Retorna JSON
            }
            catch (Exception ex) // Captura erros
            {
                _logger.LogError(ex, "Erro ao iniciar timer da tarefa #{Id}", id); // Loga o erro
                return StatusCode(500, new { success = false, error = "Erro ao iniciar o timer" }); // Retorna erro 500
            }
        }

        // Pausa o timer de uma tarefa
        [HttpPost]
        public async Task<IActionResult> PauseTimer(int id)
        {
            var task = await _context.TaskItems.FindAsync(id); // Busca a tarefa pelo ID
            if (task == null) // Verifica se a tarefa existe
            {
                return NotFound(new { success = false, error = "Tarefa não encontrada" }); // Retorna erro 404
            }

            try
            {
                task.PauseTimer(); // Pausa o timer da tarefa
                await _context.SaveChangesAsync(); // Salva as alterações no banco
                _logger.LogInformation("Timer pausado para tarefa #{Id}", id); // Loga o sucesso
                return Json(new { success = true, status = task.Status.ToString(), timeSpent = task.TimeSpent.TotalSeconds }); // Retorna JSON
            }
            catch (Exception ex) // Captura erros
            {
                _logger.LogError(ex, "Erro ao pausar timer da tarefa #{Id}", id); // Loga o erro
                return StatusCode(500, new { success = false, error = "Erro ao pausar o timer" }); // Retorna erro 500
            }
        }

        // Retoma o timer de uma tarefa pausada
        [HttpPost]
        public async Task<IActionResult> ResumeTimer(int id)
        {
            var task = await _context.TaskItems.FindAsync(id); // Busca a tarefa pelo ID
            if (task == null) // Verifica se a tarefa existe
            {
                return NotFound(new { success = false, error = "Tarefa não encontrada" }); // Retorna erro 404
            }

            try
            {
                task.ResumeTimer(); // Retoma o timer da tarefa
                await _context.SaveChangesAsync(); // Salva as alterações no banco
                _logger.LogInformation("Timer retomado para tarefa #{Id}", id); // Loga o sucesso
                return Json(new { success = true, status = task.Status.ToString(), timeSpent = task.TimeSpent.TotalSeconds }); // Retorna JSON
            }
            catch (Exception ex) // Captura erros
            {
                _logger.LogError(ex, "Erro ao retomar timer da tarefa #{Id}", id); // Loga o erro
                return StatusCode(500, new { success = false, error = "Erro ao retomar o timer" }); // Retorna erro 500
            }
        }

        // Exclui uma tarefa
        [HttpPost]
        [Route("Todo/Delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _context.TaskItems.FindAsync(id); // Busca a tarefa pelo ID
            if (task == null) // Verifica se a tarefa existe
            {
                return NotFound(new { success = false, error = "Tarefa não encontrada" }); // Retorna erro 404
            }
            if (task.IsInProgress) // Verifica se a tarefa está em andamento
            {
                return BadRequest(new { success = false, error = "Não é possível excluir uma tarefa em andamento" }); // Retorna erro 400
            }

            try
            {
                _context.TaskItems.Remove(task); // Remove a tarefa do contexto
                await _context.SaveChangesAsync(); // Salva as alterações no banco
                _logger.LogInformation("Tarefa #{Id} excluída: {Name}", id, task.Name); // Loga o sucesso
                return Json(new { success = true }); // Retorna JSON com sucesso
            }
            catch (Exception ex) // Captura erros
            {
                _logger.LogError(ex, "Erro ao excluir tarefa #{Id}", id); // Loga o erro
                return StatusCode(500, new { success = false, error = "Erro ao excluir a tarefa" }); // Retorna erro 500
            }
        }

        // Conclui uma tarefa
        [HttpPost]
        public async Task<IActionResult> CompleteTask(int id)
        {
            var task = await _context.TaskItems.FindAsync(id); // Busca a tarefa pelo ID
            if (task == null) // Verifica se a tarefa existe
            {
                return NotFound(new { success = false, error = "Tarefa não encontrada" }); // Retorna erro 404
            }

            try
            {
                task.CompleteTask(); // Conclui a tarefa
                await _context.SaveChangesAsync(); // Salva as alterações no banco
                _logger.LogInformation("Tarefa #{Id} concluída", id); // Loga o sucesso
                return Json(new { success = true, status = task.Status.ToString(), timeSpent = task.TimeSpent.TotalSeconds }); // Retorna JSON
            }
            catch (Exception ex) // Captura erros
            {
                _logger.LogError(ex, "Erro ao concluir tarefa #{Id}", id); // Loga o erro
                return StatusCode(500, new { success = false, error = "Erro ao concluir a tarefa" }); // Retorna erro 500
            }
        }
    }
}