const express = require("express");
const { connectDB } = require("../config/db");
const Session = require("../models/Session");

const router = express.Router();

/**
 * GET /api/admin/stats — Comprehensive analytics
 */
router.get("/stats", async (req, res) => {
  try {
    await connectDB();

    // 1. Unified Facet Aggregation for all categorical stats
    const facetResults = await Session.aggregate([
      {
        $facet: {
          byMode: [
            { $group: { _id: "$mode", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byGender: [
            { $match: { "userProfile.gender": { $ne: null } } },
            { $group: { _id: "$userProfile.gender", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          bySkinTone: [
            { $match: { "userProfile.skinTone": { $ne: null } } },
            { $group: { _id: "$userProfile.skinTone", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byUndertone: [
            { $match: { "userProfile.undertone": { $ne: null } } },
            { $group: { _id: "$userProfile.undertone", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byAgeRange: [
            { $match: { "userProfile.ageRange": { $ne: null } } },
            { $group: { _id: "$userProfile.ageRange", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
          byOccasion: [
            { $match: { "userProfile.occasion": { $ne: null } } },
            { $group: { _id: "$userProfile.occasion", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byBudget: [
            { $match: { "userProfile.budget": { $ne: null } } },
            { $group: { _id: "$userProfile.budget", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byStylePref: [
            { $match: { "userProfile.stylePreferences": { $exists: true, $ne: [] } } },
            { $unwind: "$userProfile.stylePreferences" },
            { $group: { _id: "$userProfile.stylePreferences", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          avgDuration: [
            { $match: { durationMs: { $gt: 0 } } },
            {
              $group: {
                _id: "$mode",
                avgMs: { $avg: "$durationMs" },
                minMs: { $min: "$durationMs" },
                maxMs: { $max: "$durationMs" },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          timeline: [
            {
              $match: {
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const stats = facetResults[0];

    // 2. Parallel meta-queries (Total, Today, Recent)
    const [totalSessions, todayCount, recentSessions] = await Promise.all([
      Session.countDocuments(),
      Session.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Session.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select("sessionId mode userProfile input durationMs createdAt")
        .lean(),
    ]);

    // 3. Post-process
    const filledTimeline = fillTimelineGaps(stats.timeline);

    return res.json({
      success: true,
      stats: {
        totalSessions,
        todayCount,
        byMode: formatAgg(stats.byMode, "unknown"),
        byGender: formatAgg(stats.byGender),
        bySkinTone: formatAgg(stats.bySkinTone),
        byUndertone: formatAgg(stats.byUndertone),
        byAgeRange: formatAgg(stats.byAgeRange),
        byOccasion: formatAgg(stats.byOccasion),
        byBudget: formatAgg(stats.byBudget),
        byStylePref: formatAgg(stats.byStylePref),
        avgDuration: stats.avgDuration.map((d) => ({
          mode: d._id,
          avgMs: Math.round(d.avgMs),
          minMs: d.minMs,
          maxMs: d.maxMs,
          count: d.count,
        })),
        timeline: filledTimeline,
        recentSessions,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
});

// Format aggregation results
function formatAgg(results, defaultId = "Unknown") {
  return results.map((r) => ({
    name: r._id || defaultId,
    value: r.count,
  }));
}

// Fill in missing days for the timeline
function fillTimelineGaps(timeline) {
  const result = [];
  const dataMap = {};
  for (const item of timeline) {
    dataMap[item._id] = item.count;
  }

  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en", { month: "short", day: "numeric" });
    result.push({ date: label, sessions: dataMap[key] || 0 });
  }

  return result;
}

module.exports = router;
