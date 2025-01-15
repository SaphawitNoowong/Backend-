const isAdmin = async(req, res, next) => {
    const user = req.user;
    if(user.role == "admin"){
        next();
    }else{
        return res.status(403).send({
            message: "Permission denied",
          });
    }
}

const isUserOrAdmin = (req, res, next) => {
    const user = req.user;
  
    if (user.role === "admin" || user.role === "user") {
      next();
    } else {
      return res.status(403).send({
        message: "Permission denied",
      });
    }
  };
  
module.exports = {
    isAdmin,
    isUserOrAdmin,
};