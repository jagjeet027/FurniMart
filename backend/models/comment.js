// import mongoose from "mongoose";

// const commentSchema = new mongoose.Schema(
//   {
//     postId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Post",
//       required: true,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     userType: {
//       type: String,
//       enum: ["user", "manufacturer", "admin"],
//       required: true,
//     },
//     text: {
//       type: String,
//       required: true,
//       maxlength: 1000,
//     },
//     parentCommentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Comment",
//       default: null,
//     },
//     likes: [
//       {
//         userId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//         },
//         createdAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//     isEdited: {
//       type: Boolean,
//       default: false,
//     },
//     editedAt: {
//       type: Date,
//     },
//   },
//   { timestamps: true }
// );

// commentSchema.index({ postId: 1, createdAt: -1 });
// commentSchema.index({ userId: 1 });

// const Comment = mongoose.model("Comment", commentSchema);
// export default Comment;
