export const errorHandler = async (err, c) => {
  console.error('Error:', err);
  
  // Handle database errors
  if (err.code && err.code.startsWith('22')) {
    return c.json({ 
      success: false,
      error: 'Invalid data format or constraints violated' 
    }, 400);
  }

  // Handle not found errors from controllers
  if (err.message === 'Item not found') {
    return c.json({ 
      success: false,
      error: err.message 
    }, 404);
  }

  // Handle other custom errors
  if (err.custom) {
    return c.json({ 
      success: false,
      error: err.message 
    }, err.statusCode || 400);
  }

  // Fallback to generic error
  return c.json({ 
    success: false,
    error: 'Internal server error' 
  }, 500);
};