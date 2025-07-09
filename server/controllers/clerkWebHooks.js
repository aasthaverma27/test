import User from "../models/User.js";
import { Webhook } from "svix";
const clerkwebhooks = async (req, res) => {
  try {
    // create an instance with svix with clerko webhook secret.
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };
    // verifying header
    await whook.verify(JSON.stringify(req.body), headers);

    //getting data fro request body
    const { data, type } = req.body;
    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: data.first_name + " " + data.last_name,
      image: data.image_url,
    };
    //switch cases
    switch (type) {
      case "user.created": {
        await User.create(userData);
        break;
      }
      case "user.updated": {
        await User.findByIdAndUpdate(data._id, userData);
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data._id);
        break;
      }
      default:
        break;
    }
    res.json({ success: true, message: "Webhook Received" });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: true,
      message: error.message,
    });
  }
};
export default clerkwebhooks;
