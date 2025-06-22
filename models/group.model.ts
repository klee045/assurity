import mongoose from "mongoose";

export const groupSchema = new mongoose.Schema({
  id: String,
  displayName: String,
  description: String,
  securityEnabled: Boolean,
  mailNickname: String,
  mailEnabled: Boolean,
  groupTypes: [String],
});

export const Group = mongoose.model("Group", groupSchema);

export interface Group {
  id: string;
  displayName: string;
  description: string;
  securityEnabled: boolean;
  mailNickname: string;
  mailEnabled: boolean;
  [key: string]: string | boolean | any[] | null;
}
export interface GetGroupResponse {
  value: Group[];
  "@odata.context"?: string;
}
