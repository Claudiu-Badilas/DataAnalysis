using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Predict.Reader.MortgageLoan.BCR;
using Predict.Readers.AccountStatement;
using Predict.Repository.TransactionRepo;
using Predict.Service.AuthorizationService;
using Predict.Service.CacheServicel;
using System.ComponentModel.DataAnnotations;

namespace Predict.Controllers;

[Route("api/v1")]
public class TransactionController(ITransactionRepo transactionRepo, IAuthService authService, ICacheService cache) : BaseController
{

    [HttpGet("transactions/{dataOwnerId}")]
    [Authorize]
    public async Task<ActionResult> GetTransactions(
        [FromHeader] string Authorization,
        [FromRoute] int dataOwnerId
    )
    {
        var user = await authService.GetUser(Authorization);
        if (!user.HasAccessToDataOwner(dataOwnerId))
        {
            return BadRequest("You do not have access to the current Data Owner!");
        }

        return Ok(await transactionRepo.GetTransactionByUserIdAndOwnerId(user.Id.Value, dataOwnerId, DateTime.UtcNow, DateTime.UtcNow));
    }

    [HttpGet("all-transactions")]
    public async Task<ActionResult> GetFreeTransactions(
        [FromHeader] string Authorization
    )
    {
        var transactions = await cache.GetOrSetAsync("GetAllTransactions", transactionRepo.GetAllTransactions, TimeSpan.FromMinutes(15));

        return Ok(transactions);
    }

    [HttpGet("transactions")]
    public async Task<ActionResult> GetTransactions([FromHeader] string Authorization)
    {
        var transactions = cache.GetOrSet(
            "GetTransactions",
            () => RaiffeisenExcelAccountStatement.transactions(),
            TimeSpan.FromDays(1)
        );

        return Ok(transactions);
    }

    [HttpGet("economii")]
    public async Task<ActionResult> GetEconomii([FromHeader] string Authorization)
    {
        var transactions = cache.GetOrSet(
            "GetEconomii",
            () => RaiffeisenExcelAccountStatement.economii(),
            TimeSpan.FromDays(1)
        );

        return Ok(transactions);
    }
}
