import { User } from "../models/User.js";
import Channel from "../models/Channel.js";
import mongoose from "mongoose";

export const createChannel = async (request, response) => {
  try {
    const { name, members } = request.body;
    const userId = request.user.id;

    const admin = await User.findById(userId);

    if (!admin) {
      return response.status(400).send("Admin user not found.");
    }

    const validMembers = await User.find({ _id: { $in: members } });

    if (validMembers.length !== members.length) {
      return response.status(400).send("Some members are not valid users.");
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();
    return response.status(201).json({ channel: newChannel });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const getUserChannel = async (request, response) => {
  try {
    const userId = new mongoose.Types.ObjectId(request.user.id);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return response.status(201).json({ channels });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const getChannelMessages = async (request, response) => {
  try {
    const { channelId } = request.params;
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: { path: 'sender', select: "firstName lastName email image _id color" },
      
    });

    if (!channel) {
      return response.status(404).send("Channel not found.");
    }

    const messages = channel.messages;
    console.log("Messages from API:", messages); // Thêm log để kiểm tra dữ liệu
    return response.status(201).json({ messages });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};
