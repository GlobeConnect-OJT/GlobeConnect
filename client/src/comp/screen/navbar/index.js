import React, { Fragment, useState, useEffect, useRef, createRef } from "react";

import {
	useDisclosure,
	useColorMode,
	Heading,
	Flex,
	IconButton,
	Icon,
	Tooltip,
	Button,
	useMediaQuery,
	Box,
	Stack,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
} from "@chakra-ui/react";

import {
	HamburgerIcon,
	MoonIcon,
	SunIcon,
	SettingsIcon,
	AddIcon,
} from "@chakra-ui/icons";

import { FaGlobeAfrica } from "react-icons/fa";

import { BsFillInfoCircleFill } from "react-icons/bs";

import { connect } from "react-redux";

import SettingsView from "../settings";
import LoginModal from "../../../components/auth/LoginModal";
import RegisterModal from "../../../components/auth/RegisterModal";
import CreatePostModal from "../../screen/post/CreatePostModal";

import { useAuth } from "../../../context/AuthContext";
import { logout } from "../../../services/authService";

import { useNavigate } from "react-router-dom";

import Actions from "../../redux/action";
import Constants from "../../utils/Constants";
import AppManager from "../../utils/AppManager";

const { MasterDrawerMenuType, MasterDrawerMenuConfig } = Constants;

const NavBarView = (props) => {
	const { userConfig } = props;

	const [state, setState] = useState({
		selectedMenuType:
			userConfig?.selectedMenuType ?? MasterDrawerMenuType.Search,
	});

	const updateState = (data) =>
		setState((preState) => ({ ...preState, ...data }));

	const { isOpen, onClose } = useDisclosure();
	const { colorMode, toggleColorMode } = useColorMode();

	const btnRef = useRef();
	const settingsRef = createRef();

	const { user, logout: authLogout } = useAuth();
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);
	const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
	
	// Check if the screen is mobile size
	const [isMobile] = useMediaQuery("(max-width: 768px)");

	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await logout(); // Call the API logout
			authLogout(); // Update the auth context
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const handleTitleClick = () => {
		navigate('/');
	};

	/*  Life-cycles Methods */

	useEffect(() => {
		return () => {};
	}, []);

	useEffect(() => {
		updateState({
			selectedMenuType:
				userConfig?.selectedMenuType ?? MasterDrawerMenuType.Search,
		});
	}, [userConfig]);

	/*  Public Interface Methods */

	/*  UI Events Methods   */

	const onPressSettings = () => {
		settingsRef.current && settingsRef.current.openModal();
	};

	const onPressAddPost = () => {
		setIsCreatePostOpen(true);
	};

	/*  Server Request Methods  */

	/*  Server Response Methods  */

	/*  Server Response Handler Methods  */

	/*  Custom-Component sub-render Methods */

	const renderMasterContainer = () => {
		return (
			<>
				<Flex
					flexDirection={"row"}
					justifyContent={"space-between"}
					alignItems={"center"}
					boxShadow="md"
					p={isMobile ? "8px" : "10px"}
					zIndex={100}
					bg={colorMode === "dark" ? "black" : "white"}
					width="100%"
				>
					<Flex
						flexDirection={"row"}
						justifyContent="flex-start"
						alignItems="center"
						paddingY={1}
						cursor="pointer"
						onClick={handleTitleClick}
					>
						<Icon
							alignSelf={"center"}
							as={FaGlobeAfrica}
							boxSize={isMobile ? "20px" : "25px"}
						/>
						<Flex
							flexDirection={"row"}
							alignItems="center"
							justifyContent="center"
						>
							<Heading
								ms={"10px"}
								size={isMobile ? "sm" : "md"}
							>
								{
									MasterDrawerMenuConfig[
										state?.selectedMenuType
									]?.mainTitle
								}
							</Heading>
						</Flex>
					</Flex>
					{isMobile ? (
						// Mobile menu with dropdown
						<Flex>
							<Menu>
								<MenuButton
									as={IconButton}
									aria-label="Options"
									icon={<HamburgerIcon />}
									variant="outline"
									size="sm"
								/>
								<MenuList>
									{user ? (
										<>
											<MenuItem onClick={onPressAddPost}>Add Post</MenuItem>
											<MenuItem onClick={handleLogout}>Logout</MenuItem>
										</>
									) : (
										<>
											<MenuItem onClick={() => setIsLoginOpen(true)}>Login</MenuItem>
											<MenuItem onClick={() => setIsRegisterOpen(true)}>Register</MenuItem>
										</>
									)}
									<MenuItem onClick={toggleColorMode}>
										{colorMode === "light" ? "Dark Mode" : "Light Mode"}
									</MenuItem>
									<MenuItem onClick={onPressSettings}>Settings</MenuItem>
								</MenuList>
							</Menu>
						</Flex>
					) : (
						// Desktop layout
						<Flex>
							{user ? (
								<>
									<Button
										variant="ghost"
										onClick={handleLogout}
										mr={2}
									>
										Logout
									</Button>
									<Button
										leftIcon={<AddIcon />}
										variant="solid"
										colorScheme="blue"
										onClick={onPressAddPost}
										mr={2}
									>
										Add Post
									</Button>
								</>
							) : (
								<>
									<Button
										variant="ghost"
										onClick={() => setIsLoginOpen(true)}
										mr={2}
									>
										Login
									</Button>
									<Button
										variant="ghost"
										onClick={() => setIsRegisterOpen(true)}
										mr={2}
									>
										Register
									</Button>
								</>
							)}
							<Tooltip label="Change Theme">
								<IconButton
									variant="link"
									icon={
										colorMode === "light" ? (
											<MoonIcon boxSize={"20px"} />
										) : (
											<SunIcon boxSize={"20px"} />
										)
									}
									onClick={toggleColorMode}
								/>
							</Tooltip>
							<Tooltip label="Settings">
								<IconButton
									ms={3}
									me={1}
									variant="link"
									icon={<SettingsIcon boxSize={"20px"} />}
									onClick={onPressSettings}
								/>
							</Tooltip>
						</Flex>
					)}
				</Flex>
				<LoginModal
					isOpen={isLoginOpen}
					onClose={() => setIsLoginOpen(false)}
				/>
				<RegisterModal
					isOpen={isRegisterOpen}
					onClose={() => setIsRegisterOpen(false)}
				/>
				<CreatePostModal
					isOpen={isCreatePostOpen}
					onClose={() => setIsCreatePostOpen(false)}
				/>
				<SettingsView ref={settingsRef} />
			</>
		);
	};

	return renderMasterContainer();
};

const mapStateToProps = (state) => {
	return {
		userConfig: state.userConfig,
		userPref: state.userPref,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setUserConfig: (userConfig) =>
			dispatch(Actions.setUserConfig(userConfig)),
		setUserPref: (userPref) => dispatch(Actions.setUserPref(userPref)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBarView);