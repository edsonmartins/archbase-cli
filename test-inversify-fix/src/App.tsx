// App.tsx
import 'reflect-metadata'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/spotlight/styles.css'
import '@archbase/components/dist/index.css'
// mantine-react-table removido no archbase-react 3.0.0
import {
  ActionIcon,
  Menu,
  Tooltip,
  Badge,
  Text,
  Flex,
  Group,
  useMantineColorScheme,
  MantineThemeOverride,
  Stack,
  Indicator,
  Avatar
} from '@mantine/core'
import { useFullscreen, useHotkeys, useLocalStorage, useMediaQuery } from '@mantine/hooks'
import { Dispatch, ErrorInfo, Fragment, ReactNode, SetStateAction, useEffect, useState, useCallback } from 'react'
import i18next from 'i18next'
import {
  IconArrowsMaximize,
  IconBell,
  IconBrandMessenger,
  IconLogout,
  IconMoonStars,
  IconSun,
  IconUserCircle
} from '@tabler/icons-react'
import { Login } from './views/login/Login'
import translation_en from './locales/en/translation.json'
import translation_ptbr from './locales/pt-BR/translation.json'
import translation_es from './locales/es/translation.json'
import testInversifyFixContainerIOC from './ioc/TestInversifyFixContainerIOC'
import { TestInversifyFixDark, TestInversifyFixLight } from './theme'
import { navigationData } from './navigation/navigationData'
import { TestInversifyFixErrorFallback } from './utils/TestInversifyFixErrorFallback'
import { TestInversifyFixUser } from './auth/TestInversifyFixAuthenticator'
import { API_TYPE } from './ioc/TestInversifyFixIOCTypes'
// Do pacote core
import {
  useArchbaseTheme,
  processErrorMessage,
  ArchbaseAppProvider,
  ArchbaseGlobalProvider,
  useArchbaseDataSource,
  ArchbaseErrorBoundary,
  ARCHBASE_IOC_API_TYPE
} from '@archbase/core';

// Do pacote data  
import {
  useArchbaseRemoteServiceApi,
  useArchbaseStore
} from '@archbase/data';

// Do pacote security
import {
  ArchbaseUserService,
  useArchbaseAuthenticationManager,
} from '@archbase/security';
import {
  defaultAvatar,
  useArchbaseAdminStore,
  ArchbaseAdminLayoutHeader,
  ArchbaseAdminMainLayout,
  ArchbaseAdminTabContainer,
  ArchbaseTabItem,
  CommandPaletteButton,
  ArchbaseMyProfileModal,
} from '@archbase/admin';

type MainProps = {
  onLoginUser: (user: TestInversifyFixUser) => void
  onLogoutUser: () => void
  user?: TestInversifyFixUser | undefined
  setUser: Dispatch<SetStateAction<TestInversifyFixUser | undefined>>
}

function Main({ onLoginUser, onLogoutUser, user, setUser }: MainProps) {
  const { toggle } = useFullscreen()
  const theme = useArchbaseTheme()
  const isMedium = useMediaQuery(`(max-width: ${theme.breakpoints.md})`)
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const adminStore = useArchbaseAdminStore()
  const templateStore = useArchbaseStore()
  const [isCollapsed, setCollapsed] = useState<boolean>(false)
  const [isHidden, setHidden] = useState<boolean>(false)
  const usuarioServiceApi = useArchbaseRemoteServiceApi<ArchbaseUserService>(ARCHBASE_IOC_API_TYPE.User)
  const [showMyProfile, setShowMyProfile] = useState<boolean>(false)
  const api = import.meta.env.VITE_API

  const { login, logout, username, isAuthenticated, error, accessToken } =
    useArchbaseAuthenticationManager({})

  const getUserInfo = useCallback(async () => {
    if (accessToken && accessToken != null) {
      try {
        const usuario = await usuarioServiceApi.getUserByEmail(username)
        onLoginUser(
          new TestInversifyFixUser({
            id: usuario.id,
            displayName: usuario.name,
            email: usuario.email,
            photo: usuario.avatar ? atob(usuario.avatar) : undefined,
            isAdmin: true
          })
        )
      } catch (err) {
        const error = processErrorMessage(err)
        if (error.includes('401')) {
          logout()
          onLogoutUser()
        }
      }
    }
  }, [accessToken, username, usuarioServiceApi, onLoginUser, logout, onLogoutUser])

  useEffect(() => {
    if (isAuthenticated) {
      getUserInfo().catch(() => {
      })
    }
  }, [isAuthenticated, getUserInfo])

  const handleLogin = (username: string, password: string, rememberMe: boolean) => {
    login(username, password, rememberMe)
  }

  const handleLogout = () => {
    templateStore.reset()
    logout();
    onLogoutUser();
  }

  const headerActions = () => {
    const result: ReactNode[] = []
    const api = import.meta.env.VITE_API
    if (api && api.includes('localhost')) {
      result.push(
        <Badge size="lg" variant="gradient" gradient={{ from: '#2f3eeb', to: '#5b63f0', deg: 90 }}>
          {`${i18next.t('test-inversify-fix:DESENVOLVIMENTO')}`}
        </Badge>
      )
    } else if (api && api.includes('homolog')) {
      result.push(
        <Badge size="lg" variant="gradient" gradient={{ from: '#2f3eeb', to: '#5b63f0', deg: 90 }}>
          HOMOLOGAÇÃO
        </Badge>
      )
    }
    result.push(
      <Tooltip withinPortal withArrow label={`${i18next.t('test-inversify-fix:Tela cheia')}`}>
        <ActionIcon variant="transparent" c={'#868E96'} onClick={toggle}>
          <IconArrowsMaximize size="2rem" />
        </ActionIcon>
      </Tooltip>
    )
    result.push(
      <Tooltip withinPortal withArrow label={`${i18next.t('test-inversify-fix:Notificações')}`}>
        <ActionIcon variant="transparent" c={'#868E96'}>
          <IconBell size="2rem" />
        </ActionIcon>
      </Tooltip>
    )
    return result
  }

  const logError = (error: Error, info: ErrorInfo) => {
    console.log(error, info)
  }

  const handleOpenMyProfileModal = () => {
    setShowMyProfile(true)
  }

  const handleCloseMyProfileModal = () => {
    setShowMyProfile(false)
  }

  const handleUpdateUser = (newName: string, newAvatar?: string) => {
    setUser(prev => {
      if (!prev) return prev;
      
      return new TestInversifyFixUser({
        id: prev.id,
        displayName: newName ?? prev.displayName,
        email: prev.email,
        photo: newAvatar ? atob(newAvatar) : prev.photo,
        isAdmin: prev.isAdmin
      });
    });
  }

  const loginView = <Login onLogin={handleLogin} error={error} />

  return (
    //@ts-ignore
    <ArchbaseErrorBoundary
      othersProps={{ style: { backgroundColor: theme.primaryColor } }}
      FallbackComponent={ TestInversifyFixErrorFallback}
      onError={logError}
    >
      {isAuthenticated && user ? (
        <Fragment>
          <ArchbaseAdminMainLayout
            sideBarCollapsedSubmenuWidth={300}
            sideBarTextDarkColor='white'
            sideBarTextLightColor='white'
            sideBarIconDarkColor='white'
            sideBarIconLightColor='white'
            sideBarBackgroundDarkColor={theme.colors.testInversifyFix[7]}
            sideBarBackgroundLightColor={theme.colors.testInversifyFix[7]}
            showHeader={isMedium}
            onCollapsedSideBar={setCollapsed}
            onHiddenSidebar={setHidden}
            navigationData={navigationData}
            sideBarWidth={'300px'}
            sideBarCollapsedWidth={'60px'}
            navigationRootLink="/"
            menuItemHeight={isCollapsed ? 44 : 34}
            sideBarFooterHeight={isMedium ? 86 : 100}
            sideBarHeaderHeight={isMedium ? 0 : 54}
            enableSecurity={true}
            sideBarHeaderContent={
              !isMedium &&
              <Fragment>
                <Group py={4} pr={isCollapsed ? 0 : 16} bg={theme.colors.testInversifyFix[8]} wrap='nowrap' gap={8} justify={isCollapsed ? "center" : "space-between"}>
                  <Text 
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: 'white',
                      marginLeft: isCollapsed ? 0 : 10
                    }}
                  >
                    {isCollapsed ? 'Test-inversify-fix' : 'Test-inversify-fix Admin'}
                  </Text>
                  {!isCollapsed && <CommandPaletteButton navigationData={navigationData} />}
                </Group>
              </Fragment>
            }
            sideBarFooterContent={
              <Stack gap={4}>
                <Menu shadow="md" width={200} position="bottom-end" withArrow arrowPosition='center' offset={-5}>
                  <Menu.Target>
                    <Group gap={20} h={50} justify={isCollapsed ? 'center' : "flex-start"}>
                      <Indicator
                        inline
                        label="A"
                        position="bottom-end"
                        disabled={!user?.isAdmin}
                        styles={{
                          indicator: {
                            display: 'flex',
                            border: '1px solid yellow',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bottom: 5,
                            right: 5,
                            width: '16px',
                            height: '16px',
                            position: 'absolute',
                            zIndex: 400,
                            borderRadius: 50,
                            backgroundColor: 'green'
                          },
                        }}
                        size={18}
                        color='green'
                        offset={7}
                      >
                        <Avatar
                          ml={isCollapsed ? 0 : 8}
                          style={{ cursor: 'pointer' }}
                          radius="xl"
                          src={user ? user.photo : defaultAvatar}
                          alt={user ? user.displayName : ''}
                        />
                      </Indicator>
                      {!isCollapsed && <Text c={"white"}>{user.displayName}</Text>}
                      {api && api.includes('localhost') && !isCollapsed ?
                        <Badge size="lg" variant="gradient" gradient={{ from: '#2f3eeb', to: '#5b63f0', deg: 90 }}>
                          {`${i18next.t('test-inversify-fix:DESENVOLVIMENTO')}`}
                        </Badge>
                        : api && api.includes('homolog') && !isCollapsed &&
                        <Badge size="lg" variant="gradient" gradient={{ from: '#2f3eeb', to: '#5b63f0', deg: 90 }}>
                          {`${i18next.t('test-inversify-fix:HOMOLOGAÇÃO')}`}
                        </Badge>
                      }
                    </Group>
                  </Menu.Target>

                  <Menu.Dropdown >
                    <Menu.Label>{`${i18next.t('test-inversify-fix:Usuário')}`}</Menu.Label>
                    <Menu.Item
                      leftSection={<IconUserCircle size={14} />}
                      onClick={handleOpenMyProfileModal}
                    >
                      {`${i18next.t('test-inversify-fix:Meu Perfil')}`}
                    </Menu.Item>
                    <Menu.Label>{`${i18next.t("archbase:Opções")}`}</Menu.Label>
                    <Menu.Item
                      leftSection={colorScheme === 'dark' ? <IconSun size={14} /> : <IconMoonStars size={14} />}
                      onClick={toggleColorScheme}
                    >
                      {`${i18next.t("archbase:toggleColorScheme")}`}
                    </Menu.Item>
                    <Menu.Item leftSection={<IconArrowsMaximize size={14} />} onClick={toggle}>{`${i18next.t(
                      'test-inversify-fix:Tela cheia'
                    )}`}</Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>{`${i18next.t('test-inversify-fix:Conta')}`}</Menu.Label>
                    <Menu.Item
                      leftSection={<IconBrandMessenger size={14} />}
                      onClick={toggleColorScheme}
                    >
                      {`${i18next.t('test-inversify-fix:Suporte')}`}
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconLogout size={14} />}
                      onClick={handleLogout}
                    >
                      {`${i18next.t('test-inversify-fix:Sair')}`}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ paddingLeft: '8px', paddingRight: '8px', backgroundColor: theme.colors.testInversifyFix[8] }}
                  h={42}
                >
                  {!isCollapsed || isHidden ? 
                    <Text size="sm" c="white" fw={500}>Test-inversify-fix</Text> 
                    : null
                  }
                  <Badge size='sm' mb={"8px"} color={theme.colors.testInversifyFix[5]}>
                    {isCollapsed ? `${import.meta.env.VITE_REACT_APP_VERSION || '1.0.0'}` : `Versão ${import.meta.env.VITE_REACT_APP_VERSION || '1.0.0'}`}
                  </Badge>
                </Flex>
              </Stack>
            }
            header={
              <ArchbaseAdminLayoutHeader
                user={user}
                headerActions={headerActions()}
                navigationData={navigationData}
                showLanguageSelector={true}
                userMenuItems={
                  <Fragment>
                    <Menu.Label>{`${i18next.t('test-inversify-fix:Usuário')}`}</Menu.Label>
                    <Menu.Item
                      leftSection={<IconUserCircle size={14} />}
                      onClick={handleOpenMyProfileModal}  
                    >
                      {`${i18next.t('test-inversify-fix:Meu Perfil')}`}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>{`${i18next.t('test-inversify-fix:Conta')}`}</Menu.Label>
                    <Menu.Item leftSection={<IconBrandMessenger size={14} />}>{`${i18next.t(
                      'test-inversify-fix:Suporte'
                    )}`}</Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconLogout size={14} />}
                      onClick={handleLogout}
                    >
                      {`${i18next.t('test-inversify-fix:Sair')}`}
                    </Menu.Item>
                  </Fragment>
                }
                logo=""
              />
            }
          >
            <ArchbaseAdminTabContainer
              onChangeActiveTabId={(activeTabId) => adminStore.setActiveTabId(activeTabId)}
              onChangeOpenedTabs={(openedTabs: ArchbaseTabItem[]) => {
                adminStore.setOpenedTabs(openedTabs)
              }}
              openedTabs={adminStore.openedTabs}
              activeTabId={adminStore.activeTabId}
              navigationData={navigationData}
            />
          </ArchbaseAdminMainLayout>
          {user && (
            <ArchbaseMyProfileModal
              opened={showMyProfile} 
              handleClose={handleCloseMyProfileModal} 
              userId={user.id} 
              updateUser={handleUpdateUser} 
              options={{
                showNickname: false,
                avatarMaxSizeKB: 100
              }}
             />
          )}
        </Fragment>
      ) : (loginView)}{' '}
    </ArchbaseErrorBoundary>
  )
}

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: true
  })
  const [dark, setThemeDark] = useState<MantineThemeOverride>(TestInversifyFixDark)
  const [light, setThemeLight] = useState<MantineThemeOverride>(TestInversifyFixLight)
  const [currentUser, setCurrentUser] = useState<TestInversifyFixUser | undefined>(undefined)

  const handleChangeCustomTheme = (dark: MantineThemeOverride, light: MantineThemeOverride) => {
    setThemeDark(dark)
    setThemeLight(light)
  }

  const toggleColorScheme = (value?: 'light' | 'dark') =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

  useHotkeys([['mod+J', () => toggleColorScheme()]])

  const handleLoginUser = (user: TestInversifyFixUser) => {
    setCurrentUser(user)
  }

  const handleLogoutUser = () => {
    setCurrentUser(undefined)
  }

  return (
    <ArchbaseGlobalProvider
      colorScheme={colorScheme}
      containerIOC={ testInversifyFixContainerIOC}
      themeDark={dark}
      themeLight={light}
      translationName="test-inversify-fix"
      translationResource={{
        en: translation_en,
        'pt-BR': translation_ptbr,
        es: translation_es
      }}
    >
      <ArchbaseAppProvider
        user={currentUser}
        owner={null}
        selectedCompany={undefined}
        variant="filled"
        setCustomTheme={handleChangeCustomTheme}
      >
        <Main
          onLoginUser={handleLoginUser}
          onLogoutUser={handleLogoutUser}
          user={currentUser}
          setUser={setCurrentUser}
        />
      </ArchbaseAppProvider>
    </ArchbaseGlobalProvider>
  )
}

export default App