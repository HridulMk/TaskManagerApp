import { ApiError, handleApiError } from "@/api/utils";
import { AxiosError } from "axios";

function makeAxiosError(status: number, data: object): AxiosError {
  return {
    response: { status, data },
    config: {},
  } as unknown as AxiosError;
}

describe("ApiError", () => {
  it("stores status and message", () => {
    const err = new ApiError("something went wrong", 400);
    expect(err.message).toBe("something went wrong");
    expect(err.status).toBe(400);
    expect(err.name).toBe("ApiError");
  });

  it("toDisplayMessage returns message when no field errors", () => {
    const err = new ApiError("fallback", 500);
    expect(err.toDisplayMessage()).toBe("fallback");
  });

  it("toDisplayMessage joins field errors", () => {
    const err = new ApiError("fallback", 400, {
      username: ["This field is required."],
      password: ["Too short.", "Must contain a number."],
    });
    expect(err.toDisplayMessage()).toBe(
      "This field is required. Too short. Must contain a number."
    );
  });
});

describe("handleApiError", () => {
  it("uses detail field when present", () => {
    const axiosErr = makeAxiosError(401, { detail: "Authentication failed." });
    const err = handleApiError(axiosErr, "fallback");
    expect(err.message).toBe("Authentication failed.");
    expect(err.status).toBe(401);
    expect(err.fieldErrors).toEqual({});
  });

  it("collects field errors from response data", () => {
    const axiosErr = makeAxiosError(400, {
      title: ["This field may not be blank."],
      due_date: ["Enter a valid date."],
    });
    const err = handleApiError(axiosErr, "fallback");
    expect(err.fieldErrors.title).toEqual(["This field may not be blank."]);
    expect(err.fieldErrors.due_date).toEqual(["Enter a valid date."]);
  });

  it("falls back to fallback message when no response", () => {
    const err = handleApiError({}, "fallback message");
    expect(err.message).toBe("fallback message");
    expect(err.status).toBe(0);
  });

  it("converts non-array field values to arrays", () => {
    const axiosErr = makeAxiosError(400, { title: "This field is required." });
    const err = handleApiError(axiosErr, "fallback");
    expect(err.fieldErrors.title).toEqual(["This field is required."]);
  });
});
