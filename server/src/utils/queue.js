// Simple in-memory queue for development
// Note: Switch to Bull/Redis or RabbitMQ for production

const logger = require('./logger');

const tasks = [];
let isProcessing = false;

/**
 * Enqueue a task function that returns a promise.
 * @param {Function} taskFn async () => Promise<void>
 */
function enqueueTask(taskFn) {
  tasks.push(taskFn);
  process.nextTick(processQueue);
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;
  while (tasks.length > 0) {
    const task = tasks.shift();
    try {
      await task();
    } catch (err) {
      logger.error('Queue task failed:', err);
    }
  }
  isProcessing = false;
}

function startQueue() {
  // No-op for in-memory; kept for API compatibility
  logger.info('In-memory queue started');
}

module.exports = {
  enqueueTask,
  startQueue
};
