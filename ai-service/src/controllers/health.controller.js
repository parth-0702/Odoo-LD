// Returns a simple status payload to confirm the service is running.
function getHealth(req, res) {
  res.status(200).json({
    status: "ok",
    service: "globetrotter-ai",
  });
}

module.exports = { getHealth };
