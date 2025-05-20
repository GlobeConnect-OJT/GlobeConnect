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
} from "@chakra-ui/react";

import {
	HamburgerIcon,
	MoonIcon,
	SunIcon,
	SettingsIcon,
} from "@chakra-ui/icons";

import { FaGlobeAfrica } from "react-icons/fa";

import { BsFillInfoCircleFill } from "react-icons/bs";

import { connect } from "react-redux";

import SettingsView from "../settings";
import LoginModal from "../../../components/auth/LoginModal";
import RegisterModal from "../../../components/auth/RegisterModal";

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

	const { user, logout: authLogout } = useAuth() || { user: null, logout: () => {} };
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);

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
					p={"10px"}
					zIndex={10}
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
							boxSize={"25px"}
						/>
						<Flex
							flexDirection={"row"}
							alignItems="center"
							justifyContent="center"
						>
							<Heading
								ms={"10px"}
								size={"md"}
							>
								{
									MasterDrawerMenuConfig[
										state?.selectedMenuType
									]?.mainTitle
								}
							</Heading>
						</Flex>
					</Flex>
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
				</Flex>
				<LoginModal
					isOpen={isLoginOpen}
					onClose={() => setIsLoginOpen(false)}
				/>
				<RegisterModal
					isOpen={isRegisterOpen}
					onClose={() => setIsRegisterOpen(false)}
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
