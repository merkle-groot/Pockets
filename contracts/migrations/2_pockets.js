const Pockets = artifacts.require("Pockets");

module.exports = function (deployer) {
  deployer.deploy(Pockets);
};
