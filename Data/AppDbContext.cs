using Microsoft.EntityFrameworkCore;
using TodoApp.Models;

namespace TodoApp.Data
{
    public class AppDbContext : DbContext
    {
        // Construtor que injeta opções (ex.: string de conexão do Program.cs)
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Conjunto de tarefas para operações CRUD no banco
        public DbSet<TaskItem> TaskItems { get; set; } // Define a tabela TaskItems no banco

        // Configuração do modelo de dados para o banco
        protected override void OnModelCreating(ModelBuilder modelBuilder) // Método chamado pelo EF Core para configurar entidades
        {
            base.OnModelCreating(modelBuilder); // Chama a implementação base

            // Configuração da entidade TaskItem
            modelBuilder.Entity<TaskItem>(entity => // Configura a entidade TaskItem
            {
                entity.HasKey(t => t.Id); // Define Id como chave primária

                // Propriedade Name: obrigatória, máx. 100 caracteres
                entity.Property(t => t.Name) // Configura a propriedade Name
                      .HasMaxLength(100) // Limita a 100 caracteres
                      .IsRequired(); // Torna obrigatória no banco

                // Status: enum convertido para string, padrão "NotStarted"
                entity.Property(t => t.Status) // Configura a propriedade Status
                      .HasDefaultValue(TaskItemStatus.NotStarted) // Define valor padrão como "NotStarted"
                      .HasConversion<string>(); // Converte o enum para string no SQLite

                // TimeSpent: TimeSpan em ticks, padrão 0
                entity.Property(t => t.TimeSpent) // Configura a propriedade TimeSpent
                      .HasDefaultValue(TimeSpan.Zero) // Define valor padrão como 0
                      .HasConversion( // Converte TimeSpan para long (ticks)
                          timeSpan => timeSpan.Ticks, // De TimeSpan para ticks
                          ticks => TimeSpan.FromTicks(ticks) // De ticks para TimeSpan
                      );

                // StartTime: permite nulos (tarefa não iniciada)
                entity.Property(t => t.StartTime) // Configura a propriedade StartTime
                      .IsRequired(false); // Permite valores nulos no banco

                // Índices para otimizar consultas por Status e StartTime
                entity.HasIndex(t => t.Status); // Cria índice para consultas por Status
                entity.HasIndex(t => t.StartTime); // Cria índice para consultas por StartTime
            });
        }
    }
}