const normalizeUser = (userDetails) => {
  const userDetailsForServer = {
    name: {
      first: userDetails.first,
      middle: userDetails.middle,
      last: userDetails.last,
    },
    phone: userDetails.phone,
    email: userDetails.email,
    password: userDetails.password,
    image: {
      url: userDetails.url,
      alt: userDetails.alt,
    },
    address: {
      state: userDetails.state,
      country: userDetails.country,
      city: userDetails.city,
      street: userDetails.street,
      houseNumber: userDetails.houseNumber,
      zip: userDetails.zip,
    },
    isBusiness: userDetails.isBusiness,
    isAdmin: userDetails.isAdmin || false, // Add isAdmin field with default false
  };

  // Add adminCode only if it's provided and not empty
  if (userDetails.adminCode && userDetails.adminCode.trim() !== "") {
    userDetailsForServer.adminCode = userDetails.adminCode;
  }

  return userDetailsForServer;
};

export default normalizeUser;
