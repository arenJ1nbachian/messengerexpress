const userConvoTypingMap = new Map();

const addTyping = (cid, uid) => {
  if (!userConvoTypingMap.has(cid)) {
    userConvoTypingMap.set(cid, new Set([uid]));
  } else {
    userConvoTypingMap.get(cid).add(uid);
  }
};

const removeTyping = (cid, uid) => {
  if (userConvoTypingMap.has(cid)) {
    userConvoTypingMap.get(cid).delete(uid);

    if (userConvoTypingMap.get(cid).size === 0) {
      userConvoTypingMap.delete(cid);
    }
  }
};

const getTypingConvos = (uid) => {
  let convos = [];
  for (const [cid, users] of userConvoTypingMap.entries()) {
    if (users.has(uid)) {
      convos.push(cid);
    }
  }
  return convos;
};

module.exports = {
  userConvoTypingMap,
  addTyping,
  removeTyping,
  getTypingConvos,
};
