using System;
using System.ComponentModel.DataAnnotations;

namespace TodoApp.Models
{
    public class TaskItem
    {
        [Key] // Marca Id como chave primária
        public int Id { get; set; } // Identificador único da tarefa

        [Required(ErrorMessage = "O nome da tarefa é obrigatório.")] // Validação: campo obrigatório
        [StringLength(100, ErrorMessage = "O nome da tarefa deve ter no máximo 100 caracteres.")] // Validação: máx. 100 caracteres
        public string Name { get; set; } = string.Empty; // Nome da tarefa, inicializado como vazio

        public TaskItemStatus Status { get; set; } = TaskItemStatus.NotStarted; // Estado da tarefa, padrão "NotStarted"

        public TimeSpan TimeSpent { get; set; } = TimeSpan.Zero; // Tempo total gasto, padrão 0

        public DateTime? StartTime { get; set; } // Horário de início do timer, nulo se inativo

        public bool IsInProgress => Status == TaskItemStatus.InProgress; // Verifica se a tarefa está em andamento

        /// <summary>
        /// Inicia o timer da tarefa, marcando o horário atual e mudando o status.
        /// Só funciona se a tarefa estiver "Não Iniciada" ou "Pausada".
        /// </summary>
        public void StartTimer()
        {
            if (Status != TaskItemStatus.NotStarted && Status != TaskItemStatus.Paused) // Verifica estado válido
            {
                throw new InvalidOperationException("Não é possível iniciar uma tarefa que já está em andamento ou concluída."); // Lança erro se inválido
            }
            StartTime = DateTime.UtcNow; // Define o horário atual como início
            Status = TaskItemStatus.InProgress; // Atualiza o status para "Em Andamento"
        }

        /// <summary>
        /// Pausa o timer, somando o tempo decorrido ao TimeSpent e limpando StartTime.
        /// Só funciona se a tarefa estiver "Em Andamento" com timer ativo.
        /// </summary>
        public void PauseTimer()
        {
            if (Status != TaskItemStatus.InProgress) // Verifica se está em andamento
            {
                throw new InvalidOperationException("Não é possível pausar uma tarefa que não está em andamento."); // Lança erro se inválido
            }
            if (!StartTime.HasValue) // Verifica se o timer foi iniciado
            {
                throw new InvalidOperationException("Timer não pode ser pausado sem um horário de início válido."); // Lança erro se inválido
            }
            TimeSpent += DateTime.UtcNow - StartTime.Value; // Calcula e soma o tempo decorrido
            StartTime = null; // Limpa o horário de início
            Status = TaskItemStatus.Paused; // Atualiza o status para "Pausada"
        }

        /// <summary>
        /// Retoma o timer de uma tarefa pausada, definindo novo StartTime.
        /// Só funciona se a tarefa estiver "Pausada".
        /// </summary>
        public void ResumeTimer()
        {
            if (Status != TaskItemStatus.Paused) // Verifica se está pausada
            {
                throw new InvalidOperationException("Não é possível retomar uma tarefa que não está pausada."); // Lança erro se inválido
            }
            StartTime = DateTime.UtcNow; // Define novo horário de início
            Status = TaskItemStatus.InProgress; // Atualiza o status para "Em Andamento"
        }

        /// <summary>
        /// Finaliza a tarefa, atualizando TimeSpent (se ativo) e marcando como "Concluída".
        /// Só funciona se a tarefa não estiver concluída ainda.
        /// </summary>
        public void CompleteTask()
        {
            if (Status == TaskItemStatus.Completed) // Verifica se já está concluída
            {
                throw new InvalidOperationException("Não é possível concluir uma tarefa que já está concluída."); // Lança erro se inválido
            }
            if (StartTime.HasValue) // Se o timer estiver ativo
            {
                TimeSpent += DateTime.UtcNow - StartTime.Value; // Calcula e soma o tempo restante
                StartTime = null; // Limpa o horário de início
            }
            Status = TaskItemStatus.Completed; // Marca como concluída
        }
    }

    public enum TaskItemStatus // Estados possíveis da tarefa
    {
        NotStarted,  // Tarefa não iniciada
        InProgress,  // Tarefa em andamento
        Paused,      // Tarefa pausada
        Completed    // Tarefa concluída
    }
}