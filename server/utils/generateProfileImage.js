const generateProfileImage = (username) => {
  if (!username)
    return "https://ui-avatars.com/api/?name=User&background=random";

  const encodedName = encodeURIComponent(username.trim());
  return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=256`;
};

module.exports = generateProfileImage;
