/**
 * Central error handler. Services throw plain Error objects with
 * human-readable messages ("You do not have permission..."); this is the
 * one place that turns them into HTTP responses, keeping HTTP status-code
 * knowledge out of the business layer entirely.
 */
function errorHandler(err, req, res, next) {
  console.error(err);
  const message = err.message || 'Something went wrong on the server';

  if (/not found/i.test(message)) return res.status(404).json({ error: message });
  if (/permission|not have access|cannot/i.test(message)) return res.status(403).json({ error: message });
  if (/required|invalid|already exists/i.test(message)) return res.status(400).json({ error: message });
  if (/invalid email or password|deactivated/i.test(message)) return res.status(401).json({ error: message });

  return res.status(500).json({ error: message });
}

module.exports = errorHandler;
