const createResponse = (status, message, content) => {
  const response = {
    status,
    message,
  };
  if (content) {
    response.content = content;
  }
  return response;
};

module.exports = createResponse;
