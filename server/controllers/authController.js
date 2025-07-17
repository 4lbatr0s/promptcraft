export const protectedRoute = (req, res) => {
  res.json({ 
    success: true,
    message: 'You are authenticated!',
    user: {
      id: req.user.id,
      email: req.user.email,
      givenName: req.user.givenName,
      familyName: req.user.familyName
    }
  })
} 