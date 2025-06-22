import { msGraphClient } from "../app";
import { GetGroupResponse, Group } from "../models/group.model";

/**
 * Retrieve all Security Groups from Microsoft Graph API
 * @returns {Group[]} Security Groups from Microsoft Graph API
 */
export const getSecurityGroups: () => Promise<
  Group[] | undefined
> = async () => {
  try {
    const groups: GetGroupResponse = await msGraphClient
      .api("/groups")
      .filter("mailEnabled eq false&securityEnabled eq true") // filter for security groups
      .get();

    return groups.value;
  } catch (err: any) {
    throw new Error("Error getting security groups");
  }
};

/**
 * Takes securityGroups passed in as argument and loops through them to perform said actions:
 * 1. Check if security group already exists in MongoDB
 * 2. Create the security group in MongoDB if it does not exist
 * 3. Push the details of the created security group into createdGroups array to return at the end
 *
 * @param securityGroups Security Groups retrieved from Microsoft Graph API
 * @returns {Group[]} Security Groups that do not yet exist in MongoDB and were newly created
 */
export const createIfNotExistSecurityGroups: ({
  securityGroups,
}: {
  securityGroups: Group[];
}) => Promise<Group[]> = async ({ securityGroups }) => {
  try {
    const createdGroups: Group[] = [];

    for (let group of securityGroups) {
      const existingGroup = await Group.findOne({ id: group.id });
      if (!existingGroup) {
        const newGroup = new Group({
          id: group.id,
          displayName: group.displayName,
          mailEnabled: group.mailEnabled,
          securityEnabled: group.securityEnabled,
        });
        await newGroup.save();

        createdGroups.push(group);
      }
    }

    return createdGroups;
  } catch (err: any) {
    throw new Error("Error creating security groups");
  }
};

/**
 * Loops through a list of Security Groups obtained from Azure
 * Updates security group details if it exists in MongoDB
 * Creates new document in MongoDB if it does not yet exist
 * @param securityGroups List of Microsoft Azure Security Groups
 * @returns void
 */
export const upsertSecurityGroups: ({
  securityGroups,
}: {
  securityGroups: Group[];
}) => void = async ({ securityGroups }) => {
  try {
    const options = { upsert: true };

    for (let group of securityGroups) {
      const query = { id: group.id };
      const update = {
        displayName: group.displayName,
        description: group.description,
        mailEnabled: group.mailEnabled,
        securityEnabled: group.securityEnabled,
        createdDateTime: group.createdDateTime,
      };
      await Group.updateOne(query, update, options);
    }
  } catch (err: any) {
    throw new Error("Error creating security groups");
  }
};

/**
 * Syncs security groups in MongoDB with Microsoft Azure by:
 * 1. Retrieve Security Groups from Microsoft Graph API
 * 2. Create if not exists the above-mentioned retrieved Security Groups
 * @returns void
 */
export const syncSecurityGroups: () => void = async () => {
  try {
    // get list of security groups
    const securityGroups: Group[] | undefined = await getSecurityGroups();

    // upsert security groups to sync MongoDB with Microsoft Azure
    if (securityGroups && securityGroups.length > 0) {
      await upsertSecurityGroups({ securityGroups: securityGroups });
    }
  } catch (err: any) {
    throw new Error("Error syncing security groups");
  }
};
