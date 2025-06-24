import mongoose, { Schema } from "mongoose";

export const groupSchema = new mongoose.Schema({
  id: String,
  displayName: String,
  description: String,
  securityEnabled: Boolean,
  mailNickname: String,
  mailEnabled: Boolean,
  groupTypes: [String],
  deletedDateTime: String,
  classification: Schema.Types.Mixed,
  createdDateTime: String,
  creationOptions: [Schema.Types.Mixed],
  expirationDateTime: String,
  isAssignableToRole: Boolean,
  mail: Schema.Types.Mixed,
  membershipRule: Schema.Types.Mixed,
  membershipRuleProcessingState: Schema.Types.Mixed,
  onPremisesDomainName: String,
  onPremisesLastSyncDateTime: String,
  onPremisesNetBiosName: String,
  onPremisesSamAccountName: String,
  onPremisesSecurityIdentifier: String,
  onPremisesSyncEnabled: Boolean,
  preferredDataLocation: String,
  preferredLanguage: String,
  proxyAddresses: [Schema.Types.Mixed],
  renewedDateTime: String,
  resourceBehaviorOptions: [Schema.Types.Mixed],
  resourceProvisioningOptions: [Schema.Types.Mixed],
  securityIdentifier: String,
  theme: Schema.Types.Mixed,
  uniqueName: String,
  visibility: String,
  onPremisesProvisioningErrors: [Schema.Types.Mixed],
  serviceProvisioningErrors: [Schema.Types.Mixed],
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
