import z from "zod";

const commentSchema = z.object({
	comment: z.string().min(1, "Comment is required").max(255, "Comment is too long"),
});

export default commentSchema;
