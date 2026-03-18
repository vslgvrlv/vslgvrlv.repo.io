(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.EclipseAutoChannels = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  function toNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function calcChannelStats(channels, context) {
    const baseAvgCheck = toNumber(context && context.avgCheck);
    const commissionPct = toNumber(context && context.commissionPct) / 100;

    return (channels || [])
      .filter(channel => channel && channel.active)
      .map(channel => {
        const leads = toNumber(channel.leads);
        const budget = toNumber(channel.budget);
        const conv = toNumber(channel.conv);
        const rawAvgCheck = toNumber(channel.avgCheck);
        const avgCheckMode = rawAvgCheck > 0 ? 'manual' : 'auto';
        const effectiveAvgCheck = avgCheckMode === 'manual' ? rawAvgCheck : baseAvgCheck;
        const paid = Math.round(leads * (conv / 100));
        const cpl = leads > 0 ? budget / leads : 0;
        const cac = paid > 0 ? budget / paid : 0;
        const revenue = paid * effectiveAvgCheck * commissionPct;

        return {
          ...channel,
          avgCheckMode,
          effectiveAvgCheck,
          paid,
          cpl,
          cac,
          revenue,
        };
      });
  }

  function summarizeChannelStats(stats) {
    const safeStats = stats || [];
    const totalBudget = safeStats.reduce((sum, channel) => sum + toNumber(channel.budget), 0);
    const totalLeads = safeStats.reduce((sum, channel) => sum + toNumber(channel.leads), 0);
    const totalPaid = safeStats.reduce((sum, channel) => sum + toNumber(channel.paid), 0);
    const totalRevenue = safeStats.reduce((sum, channel) => sum + toNumber(channel.revenue), 0);

    return {
      totalBudget,
      totalLeads,
      totalPaid,
      totalRevenue,
      totalCpl: totalLeads > 0 ? totalBudget / totalLeads : 0,
      totalCac: totalPaid > 0 ? totalBudget / totalPaid : 0,
    };
  }

  return {
    calcChannelStats,
    summarizeChannelStats,
  };
});
