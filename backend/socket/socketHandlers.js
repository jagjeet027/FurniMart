import { supportIssues } from '../data/supportIssues.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.emit('supportIssues', supportIssues);

    socket.on('selectIssue', (issueKey) => {
      const response = supportIssues[issueKey]?.response;
      if (response) {
        socket.emit('issueResponse', {
          issue: supportIssues[issueKey].title,
          response
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
