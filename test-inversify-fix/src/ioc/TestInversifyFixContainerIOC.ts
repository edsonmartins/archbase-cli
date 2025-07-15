import axios from "axios";
import { API_TYPE } from "./TestInversifyFixIOCTypes";
import { TestInversifyFixAuthenticator } from "../auth/TestInversifyFixAuthenticator";
import { IOCContainer } from "@archbase/core";
import { ArchbaseAuthenticator } from "@archbase/security";
import { ArchbaseAxiosRemoteApiClient, ArchbaseRemoteApiClient } from "@archbase/data";
import { 
  DefaultArchbaseTokenManager, 
  ArchbaseUserService,
  ArchbaseProfileService,
  ArchbaseGroupService,
  ArchbaseResourceService
} from "@archbase/security";

axios.defaults.baseURL = import.meta.env.VITE_API;

const container = IOCContainer.getContainer(); 

// Registra o token manager padrão
IOCContainer.registerTokenManager(DefaultArchbaseTokenManager);

// Registra os serviços de segurança
IOCContainer.registerSecurityServices({
  userService: ArchbaseUserService,
  profileService: ArchbaseProfileService,
  groupService: ArchbaseGroupService,
  resourceService: ArchbaseResourceService
});

// Registra serviços customizados do projeto
container
  .bind<ArchbaseAuthenticator>(API_TYPE.Authenticator)
  .to(TestInversifyFixAuthenticator);
container
  .bind<ArchbaseRemoteApiClient>(API_TYPE.ApiClient)
  .to(ArchbaseAxiosRemoteApiClient);

export default container;