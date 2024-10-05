import { User } from "../models/User.js";

export const searchContacts = async (request, response) => {
  try {
    const { searchTerm } = request.body;

    if (!searchTerm) {
      return response
        .status(400)
        .json({ status: false, message: "SearchTerm is required" });
    }

    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    console.log("Sanitized search term:", sanitizedSearchTerm);

    const regex = new RegExp(sanitizedSearchTerm, "i");
    console.log("Search regex:", regex);

    // Kiểm tra xem người dùng hiện tại là ai, và log ra trước khi query
    console.log("Current user:", request.user);

    // Kiểm tra xem trong database có dữ liệu không
    const allUsers = await User.find({});
    console.log("All users:", allUsers);

    const contacts = await User.find({
      $and: [
        { _id: { $ne: request.user.id } },
        { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
      ],
    });

    console.log("Found contacts:", contacts);

    if (contacts.length === 0) {
      return response.status(404).json({ status: false, message: "No contacts found" });
    }

    return response.status(200).json({ contacts });
  } catch (error) {
    console.log("Error in searchContacts:", error);
    return response.status(500).send("Internal Server Error");
  }
};

