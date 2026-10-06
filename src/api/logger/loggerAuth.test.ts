import axios, { AxiosAdapter } from "axios";
import { attachLoggerAuth } from "./loggerAuth";

const echoAdapter = (status = 200): AxiosAdapter => async (config) => {
  if (status >= 400) {
    return Promise.reject({ response: { status }, config });
  }
  return { data: config.headers?.Authorization ?? null, status, statusText: "OK", headers: {}, config };
};

describe("attachLoggerAuth", () => {
  it("adds the bearer token to each request", async () => {
    const instance = attachLoggerAuth(axios.create({ adapter: echoAdapter() }), () => "abc", jest.fn());
    const res = await instance.get("/x");
    expect(res.data).toBe("Bearer abc");
  });

  it("sends no header when there is no token", async () => {
    const instance = attachLoggerAuth(axios.create({ adapter: echoAdapter() }), () => undefined, jest.fn());
    const res = await instance.get("/x");
    expect(res.data).toBeNull();
  });

  it("calls onForbidden on 403 and still rejects", async () => {
    const onForbidden = jest.fn();
    const instance = attachLoggerAuth(axios.create({ adapter: echoAdapter(403) }), () => "abc", onForbidden);
    await expect(instance.get("/x")).rejects.toBeTruthy();
    expect(onForbidden).toHaveBeenCalledTimes(1);
  });
});
