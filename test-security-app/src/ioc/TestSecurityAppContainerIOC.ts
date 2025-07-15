import axios from "axios";
import { API_TYPE } from "./TestSecurityAppIOCTypes";
import { TestSecurityAppAuthenticator } from "../auth/TestSecurityAppAuthenticator";
import { IOCContainer } from "@archbase/core";
import { ArchbaseAuthenticator } from "@archbase/security";
import { ArchbaseAxiosRemoteApiClient, ArchbaseRemoteApiClient } from "@archbase/data";

axios.defaults.baseURL = import.meta.env.VITE_API;

IOCContainer.registerDefaultContainers();
const container = IOCContainer.getContainer(); 

container
  .bind<ArchbaseAuthenticator>(API_TYPE.Authenticator)
  .to(TestSecurityAppAuthenticator);
container
  .bind<ArchbaseRemoteApiClient>(API_TYPE.ApiClient)
  .to(ArchbaseAxiosRemoteApiClient);

export default container;