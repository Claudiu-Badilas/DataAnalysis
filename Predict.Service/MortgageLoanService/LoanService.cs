using Predict.Reader.MortgageLoan.BCR;
using Predict.Service.CacheServicel;
using static Predict.Reader.MortgageLoan.BCR.Types.BCRLoanTypes;

namespace Predict.Service;

public class LoanService(ICacheService cache) : ILoanService
{
    public List<GraficRambursare> GetBcrMortgageLoans()
    {
        var loanDetailss = cache.GetOrSet(
            "getBcrLoanDetails",
            BCRLoanReader.getBcrLoanDetails,
            TimeSpan.FromMinutes(15));

        return [.. loanDetailss];
    }
}
