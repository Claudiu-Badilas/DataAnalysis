using Microsoft.AspNetCore.Mvc;
using Predict.Service;

namespace Predict.Controllers;

[Route("api/v1")]
public class LoanController(ILoanService mortgageLoanService) : BaseController
{

    [HttpGet("loan/bcr")]
    public async Task<ActionResult> GetMortgageLoanDetails() 
        => Ok(mortgageLoanService.GetBcrMortgageLoans());
}