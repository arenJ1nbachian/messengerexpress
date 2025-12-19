const userConvoTypingMap = new Map();
const userTypingTimeouts = new Map();

const addTyping = (cid, uid, tid) => {
  const key = `${cid}:${uid}`;
  if (!userConvoTypingMap.has(cid)) {
    userConvoTypingMap.set(cid, new Set([uid]));
  } else {
    userConvoTypingMap.get(cid).add(uid);
  }
  if (userTypingTimeouts.has(key)) {
    clearTimeout(userTypingTimeouts.get(key));
    userTypingTimeouts.delete(key);
  }
  userTypingTimeouts.set(key, tid);
};

const removeTyping = (cid, uid) => {
  const key = `${cid}:${uid}`;
  if (userConvoTypingMap.has(cid)) {
    userConvoTypingMap.get(cid).delete(uid);

    if (userConvoTypingMap.get(cid).size === 0) {
      userConvoTypingMap.delete(cid);
    }
  }
  if (userTypingTimeouts.has(key)) {
    clearTimeout(userTypingTimeouts.get(key));
    userTypingTimeouts.delete(key);
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
