using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TodoApp.Models;

namespace TodoApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger; // Logger para monitoramento

        // Construtor que injeta o logger
        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger; // Armazena o logger injetado
        }

        // Carrega a view principal após o usuário estar configurado
        public IActionResult Index()
        {
            _logger.LogInformation("Acessando a página principal (Index)."); // Loga o acesso
            return View(); // Retorna a view Index.cshtml
        }

        // Exibe a página de privacidade
        public IActionResult Privacy()
        {
            return View(); // Retorna a view Privacy.cshtml
        }

        // Página de erro personalizada, sem cache
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)] // Impede cache da página de erro
        public IActionResult Error()
        {
            var requestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier; // Obtém o ID da requisição para rastreamento
            _logger.LogError("Erro detectado. RequestId: {RequestId}", requestId); // Loga o erro
            return View(new ErrorViewModel { RequestId = requestId }); // Retorna a view com o modelo de erro
        }

        // Página inicial onde o usuário define o nome (antigo "Home")
        public IActionResult Welcome()
        {
            _logger.LogInformation("Acessando a página de boas-vindas (Welcome)."); // Loga o acesso
            return View(); // Retorna a view Welcome.cshtml
        }
    }
}