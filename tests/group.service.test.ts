import { msGraphClient } from "../app";
import { GetGroupResponse } from "../models/group.model";
import * as GroupService from "../services/group.service";

jest.mock("../app", () => ({
  msGraphClient: {
    api: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    get: jest.fn(),
  },
  pinoLogger: {
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    },
  },
}));

// TODO: figure out how to mock the mongoose Model method calls to test the other service functions
describe("Group Service", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // clear previous mock calls before each test
  });

  describe("getSecurityGroups", () => {
    it("should retrieve security groups from MS Graph API", async () => {
      const mockResponse: GetGroupResponse = {
        value: [
          {
            id: "1",
            displayName: "Group 1",
            mailEnabled: false,
            securityEnabled: true,
            description: "Test group",
            mailNickname: "",
          },
        ],
      };

      // mocking empty str to remove error warnings since arg not needed for mocked msGraphClient
      const mockApiFilterStr: string = "";

      (
        msGraphClient.api(mockApiFilterStr).filter(mockApiFilterStr)
          .get as jest.Mock
      ).mockResolvedValue(mockResponse);

      const groups = await GroupService.getSecurityGroups();

      expect(groups).toEqual(mockResponse.value);
      expect(
        msGraphClient.api(mockApiFilterStr).filter(mockApiFilterStr).get
      ).toHaveBeenCalledWith();
    });

    it("should throw an error if unable to retrieve security groups from MS Graph API", async () => {
      // mocking empty str to remove error warnings since arg not needed for mocked msGraphClient
      const mockApiFilterStr: string = "";

      (
        msGraphClient.api(mockApiFilterStr).filter(mockApiFilterStr)
          .get as jest.Mock
      ).mockRejectedValue(new Error("Error getting security groups"));

      await expect(GroupService.getSecurityGroups()).rejects.toThrow(
        "Error getting security groups"
      );
    });
  });
});
