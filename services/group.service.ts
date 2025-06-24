import { msGraphClient, pinoLogger } from "../app";
import { ERROR_MESSAGE } from "../constants/error";
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

    pinoLogger.logger.debug(
      `Security Groups retrieved: ${JSON.stringify(groups.value)}`
    );
    return groups.value;
  } catch (err: any) {
    pinoLogger.logger.debug({ err }, "Error getting security groups");

    if (err.statusCode === 401) {
      throw new Error(ERROR_MESSAGE.UNAUTHORIZED);
    } else if (err.statusCode === 403) {
      throw new Error(ERROR_MESSAGE.FORBIDDEN);
    }

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
          ...group,
        });
        await newGroup.save();

        createdGroups.push(group);
      }
    }

    pinoLogger.logger.debug("Groups have been created");
    return createdGroups;
  } catch (err: any) {
    pinoLogger.logger.debug({ err }, "Error creating security groups");
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

    const securityGroupUpdates: {
      updateOne: {
        filter: {
          id: string;
        };
        update: Group;
        upsert: boolean;
      };
    }[] = securityGroups.map((securityGroup: Group) => ({
      updateOne: {
        filter: { id: securityGroup.id },
        update: securityGroup,
        upsert: true,
      },
    }));

    await Group.bulkWrite(securityGroupUpdates);
    pinoLogger.logger.debug("Groups have been updated/created");
  } catch (err: any) {
    pinoLogger.logger.debug({ err }, "Error upserting security groups");
    throw new Error("Error upserting security groups");
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
    pinoLogger.logger.debug({ err }, "Error syncing security groups");
    throw new Error("Error syncing security groups");
  }
};
