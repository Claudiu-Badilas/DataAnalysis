using Predict.Common.Configuration;
using Predict.Configuration.Context;
using Predict.Extensions;
using Predict.Middleware;
using Predict.Repository.ReceiptRepo;
using Predict.Repository.TransactionRepo;
using Predict.Repository.UserRepo;
using Predict.Service;
using Predict.Service.AccountService;
using Predict.Service.AuthorizationService;
using Predict.Service.CacheService;
using Predict.Service.CacheServicel;
using Predict.Service.TokenService;
using Microsoft.OpenApi;

namespace Predict;

public class Startup(IConfiguration config)
{
    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<IDapperContext, DapperContext>();

        services.AddControllers();
        services.AddCors();

        services.AddMemoryCache();
        services.AddSingleton<ICacheService, MemoryCacheService>();

        services.AddSingleton<IUserRepository, UserRepository>();
        services.AddSingleton<ITransactionRepo, TransactionRepo>();
        services.AddSingleton<IReceiptRepo, ReceiptRepo>();

        services.AddSingleton<ITokenService, TokenService>();
        services.AddSingleton<IAccountService, AccountService>();
        services.AddSingleton<IAuthService, AuthService>();
        services.AddSingleton<IReceiptsService, ReceiptsService>();
        services.AddSingleton<ILoanService, LoanService>();

        services.AddSingleton<IEnvironmentConfiguration, EnvironmentConfiguration>();

        services.AddIdentityServices(config, new EnvironmentConfiguration());

        // Swagger
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Predict API",
                Version = "v1"
            });

            // Add JWT Bearer support in Swagger UI
            //options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            //{
            //    Name = "Authorization",
            //    Type = SecuritySchemeType.ApiKey,
            //    Scheme = "Bearer",
            //    BearerFormat = "JWT",
            //    In = ParameterLocation.Header,
            //    Description = "Enter: Bearer {your token}"
            //});

            //options.AddSecurityRequirement(new OpenApiSecurityRequirement
            //{
            //    {
            //        new OpenApiSecurityScheme
            //        {
            //            Reference = new OpenApiReference
            //            {
            //                Type = ReferenceType.SecurityScheme,
            //                Id = "Bearer"
            //            }
            //        },
            //        Array.Empty<string>()
            //    }
            //});
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Predict API v1");
            options.RoutePrefix = "swagger";
        });

        app.UseMiddleware<ExceptionMiddleware>();

        app.UseRouting();

        app.UseCors(builder =>
            builder.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod()
        );

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}