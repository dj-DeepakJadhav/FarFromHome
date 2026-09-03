#!/usr/bin/env node
/**
 * Token Cost Tracker
 *
 * Displays savings from Graft + Cold Memory system
 * Usage: node track-costs.js
 */

const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.claude',
  'cold-memory.json'
);

const MODEL_PRICES = {
  'claude-haiku': 0.00080,
  'claude-sonnet': 0.00300,
  'claude-opus': 0.01500,
};

function formatCurrency(dollars) {
  return `$${dollars.toFixed(4)}`;
}

function formatTokens(num) {
  return num.toLocaleString();
}

function showCostSummary() {
  if (!fs.existsSync(MEMORY_FILE)) {
    console.log('\n📊 No memory yet. Run some agent tasks first!\n');
    console.log('After you run tasks with Claude Code, their costs will appear here.');
    return;
  }

  try {
    const memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));

    console.log('\n📊 Token Cost Summary');
    console.log('====================\n');

    let totalTokens = 0;
    let totalCost = 0;
    let totalTime = 0;
    let totalTasks = 0;

    // Per-agent breakdown
    const agents = [];
    for (const agentId in memory) {
      const entries = memory[agentId] || [];
      const agentTokens = entries.reduce((sum, e) => sum + (e.tokenCost || 0), 0);
      const agentTime = entries.reduce((sum, e) => sum + (e.timeSpent || 0), 0);
      const tasks = new Set(entries.map((e) => e.key)).size;

      totalTokens += agentTokens;
      totalTime += agentTime;
      totalTasks += tasks;

      if (agentTokens > 0) {
        const model = 'claude-sonnet'; // Assume Sonnet
        const cost = (agentTokens * MODEL_PRICES[model]) / 1_000_000;
        totalCost += cost;

        agents.push({
          name: agentId,
          tokens: agentTokens,
          cost,
          tasks,
          avgTokens: Math.round(agentTokens / tasks),
          avgTime: Math.round(agentTime / tasks),
        });
      }
    }

    // Display per-agent
    if (agents.length > 0) {
      console.log('Per-Agent Breakdown:');
      console.log('-------------------');

      agents.forEach((a) => {
        console.log(`\n${a.name}:`);
        console.log(`  Tokens:       ${formatTokens(a.tokens)}`);
        console.log(`  Tasks:        ${a.tasks}`);
        console.log(`  Cost:         ${formatCurrency(a.cost)}`);
        console.log(`  Avg/task:     ${formatTokens(a.avgTokens)} tokens (${a.avgTime}s)`);
      });
    }

    // Totals
    console.log('\n\nOverall Summary:');
    console.log('----------------');
    console.log(`Total Tokens: ${formatTokens(totalTokens)}`);
    console.log(`Total Cost:   ${formatCurrency(totalCost)}`);
    console.log(`Total Tasks:  ${totalTasks}`);
    console.log(`Total Time:   ${Math.round(totalTime / 60)} minutes`);

    if (totalTasks > 0) {
      console.log(`\nAverages:`);
      console.log(`  Tokens/task: ${formatTokens(Math.round(totalTokens / totalTasks))}`);
      console.log(`  Cost/task:   ${formatCurrency(totalCost / totalTasks)}`);
      console.log(`  Time/task:   ${Math.round(totalTime / totalTasks)}s`);
    }

    // Projected savings
    console.log('\n\nEstimated Savings vs Cold Baseline:');
    console.log('------------------------------------');

    const BASELINE_TOKENS_PER_TASK = 6900; // Without Graft
    const BASELINE_COST_PER_TASK = (BASELINE_TOKENS_PER_TASK * MODEL_PRICES['claude-sonnet']) / 1_000_000;
    const BASELINE_TIME_PER_TASK = 10 * 60; // seconds

    if (totalTasks > 0) {
      const savedTokensPerTask = BASELINE_TOKENS_PER_TASK - (totalTokens / totalTasks);
      const tokenReduction = ((savedTokensPerTask / BASELINE_TOKENS_PER_TASK) * 100).toFixed(1);

      const savedCostPerTask = BASELINE_COST_PER_TASK - (totalCost / totalTasks);
      const costReduction = ((savedCostPerTask / BASELINE_COST_PER_TASK) * 100).toFixed(1);

      const savedTimePerTask = BASELINE_TIME_PER_TASK - (totalTime / totalTasks);
      const timeReduction = ((savedTimePerTask / BASELINE_TIME_PER_TASK) * 100).toFixed(1);

      console.log(`Token reduction:  ${tokenReduction}% (${formatTokens(savedTokensPerTask)} saved/task)`);
      console.log(`Cost reduction:   ${costReduction}% (${formatCurrency(savedCostPerTask)} saved/task)`);
      console.log(`Time reduction:   ${timeReduction}% (${Math.round(savedTimePerTask)}s saved/task)`);

      // Monthly/yearly projections
      const monthlyTasks = Math.max(totalTasks, 1);
      const monthlySavings = totalTasks > 0 ? savedCostPerTask * monthlyTasks * 30 : 0;
      const annualSavings = monthlySavings * 12;

      console.log(`\nProjected Savings (30 tasks/month):`);
      console.log(`  Monthly: ${formatCurrency(monthlySavings)}`);
      console.log(`  Annual:  ${formatCurrency(annualSavings)}`);
    }

    // Recommendations
    console.log('\n\n💡 Recommendations:');
    console.log('-------------------');

    if (totalTasks < 5) {
      console.log('• Run more tasks to build up the Cold Memory database');
      console.log('• Patterns emerge after ~5-10 tasks, increasing savings');
    } else if (totalTokens > totalTasks * 3000) {
      console.log('• Your average tokens/task is still high');
      console.log('• Tip: Use graft ask before exploring files');
      console.log('• Tip: Check Cold Memory for similar past tasks');
    } else {
      console.log('✅ Great job! Your system is optimized.');
      console.log('• Keep using graft ask and Cold Memory checks');
      console.log('• Savings will compound over time');
    }

    console.log('\n');
  } catch (e) {
    console.error('Error reading memory:', e.message);
  }
}

// Run
showCostSummary();
