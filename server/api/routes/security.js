const express = require('express');
const router = express.Router();

// Get security wait times for an airport
router.get('/:airport/wait-times', (req, res) => {
  const { airport } = req.params;
  
  // For MVP, return mock data
  const waitTimes = [
    {
      id: 'security-t1',
      checkpoint: 'Terminal 1 Security',
      waitMinutes: Math.floor(Math.random() * 40) + 5,
      status: 'medium',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'security-t2',
      checkpoint: 'Terminal 2 Security',
      waitMinutes: Math.floor(Math.random() * 40) + 5,
      status: 'low',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'security-t3',
      checkpoint: 'Terminal 3 Security',
      waitMinutes: Math.floor(Math.random() * 40) + 5,
      status: 'high',
      lastUpdated: new Date().toISOString()
    }
  ];
  
  // Calculate status based on wait time
  waitTimes.forEach(checkpoint => {
    if (checkpoint.waitMinutes < 15) {
      checkpoint.status = 'low';
    } else if (checkpoint.waitMinutes < 30) {
      checkpoint.status = 'medium';
    } else {
      checkpoint.status = 'high';
    }
  });
  
  res.json(waitTimes);
});

module.exports = router;