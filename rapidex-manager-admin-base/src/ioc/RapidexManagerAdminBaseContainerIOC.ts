import axios from "axios";
import { API_TYPE } from "./RapidexManagerAdminBaseIOCTypes";
import { RapidexManagerAdminBaseAuthenticator } from "../auth/RapidexManagerAdminBaseAuthenticator";
import { IOCContainer } from "archbase-react";
import { ArchbaseAuthenticator } from "archbase-react";
import { ArchbaseAxiosRemoteApiClient, ArchbaseRemoteApiClient } from "archbase-react";
import { TenantService } from "../services/TenantService";

axios.defaults.baseURL = import.meta.env.VITE_API;

IOCContainer.registerDefaultContainers();
const container = IOCContainer.getContainer(); 

container
  .bind<ArchbaseAuthenticator>(API_TYPE.Authenticator)
  .to(RapidexManagerAdminBaseAuthenticator);
container
  .bind<ArchbaseRemoteApiClient>(API_TYPE.ApiClient)
  .to(ArchbaseAxiosRemoteApiClient);
container
  .bind<TenantService>(API_TYPE.Tenant)
  .to(TenantService);

export default container;