import React, { useEffect, useState } from "react";
import bg_img from "../assets/prompt_bg.svg";
import sidebar_img from "../assets/sidebar_bg.svg";
import logo from "../assets/fingeni_by_chistats_logo.svg";
import { BsArrowRightCircleFill, BsArrowLeftCircleFill } from "react-icons/bs";
import send_img from "../assets/sent.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { ImUser } from "react-icons/im";
import loading_img from "../assets/assistant.svg";
import loading_animation from "../assets/loading_animation.svg";
import { MdDeleteForever } from "react-icons/md";

const PromptPage = () => {
  const navigate = useNavigate();
  const username = "Aditya";
  const API = `http://127.0.0.1:8004/gpt`;

  // Sidebar handling system.
  const [sidebar, setSidebar] = useState(false);

  // State for handling text.
  const [text, setText] = useState("");

  // State for query Question
  const [queryQuestion, setQueryQuestion] = useState(null);

  // State for query Answer
  const [queryAnswer, setQueryAnswer] = useState(null);

  // State for setting chat session
  const [chatSessions, setChatSessions] = useState([
    {
      title: "My name is Vinit Gite and i am a frontend developer in Chistats ",
      messages: [],
    },
  ]);

  // state for setting session index
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);

  // newChat state.
  const [newChat, setNewChat] = useState(true);

  // State for handling chat history..
  const [chatHistory, setChatHistory] = useState([]);

  const [isChat, setIsChat] = useState(false);

  const [onreload, setOnReload] = useState(false);

  // State for loading animation
  const [loading, setLoading] = useState(false);

  // history data saving
  const [history, setHistory] = useState([{}])

  // Sidebar motion
  const sidebarMotion = () => {
    setSidebar(!sidebar);
  };

  // UseEffect to fetching chat history
  useEffect(() => {
    async function fetchHistory() {
      const response = await axios.get(`${API}/history?username=${username}`);
      const historyRes = response.data.history_list;
      // console.log(historyRes);
      setChatHistory(historyRes);
      setOnReload(true);
    }
    fetchHistory();
  }, []);

  // function for handling api repsonses.
  const handleAPI = async () => {
    setNewChat(false);
    setLoading(true);
    if (!text) {
      alert("Please enter some query!!!");
      return;
    }

    let id = "";
    if (isChat) {
      id = chatHistory[currentSessionIndex];
      console.log("id", id);
    }
    try {
      const response = await axios.post(`${API}/ask`, {
        question: text,
        uid: !isChat,
        chat_id: `${id}`,
        title: text,
      });
      setText("");

      if (response) {
        fetchChatHistory();
        setLoading(false);
        const newQuestion = response.data.question;
        const newAnswer = response.data.response;

        setQueryQuestion(newQuestion);
        setQueryAnswer(newAnswer);
        setIsChat(true);
        const updatedSessions = [...chatSessions];
        const currentSession = updatedSessions[currentSessionIndex];

        // Update title if it's the first question in the session
        if (currentSession.messages.length === 0) {
          currentSession.title = newQuestion;
        }

        currentSession.messages = [
          ...currentSession.messages,
          { question: newQuestion, answer: newAnswer },
        ];
        setChatSessions(updatedSessions);
        saveChatSessionsToLocalStorage(updatedSessions);
      } else {
        setLoading(false);
        alert("Error");
      }
    } catch (error) {
      console.log("Error while getting data", error);
    }
  };

  // Saving Chat to local storage
  const saveChatSessionsToLocalStorage = (sessions) => {
    localStorage.setItem("chatSessions", JSON.stringify(sessions));
  };

  // Function for fetching chat history
  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${API}/history?username=${username}`);
      const historyStatus = response.data.status;
      const historyRes = response.data.history_list;
      console.log(historyRes);

      setChatHistory(historyRes);

      if (historyStatus) {
        const historySessions = await Promise.all(
          historyRes.map(async (history) => {
            const res = await axios.get(
              `${API}/chat_history?username=${username}&chat_record=${history.id}`
            );
            return {
              title: history.title,
              messages: res.data.messages.map((msg) => ({
                question: msg.question,
                answer: msg.response,
              })),
            };
          })
        );

        console.log(`History Sessions- ${historySessions}`);
        const updatedSessions = [...chatSessions, ...historySessions];
        setChatSessions(updatedSessions);
        saveChatSessionsToLocalStorage(updatedSessions);
      }
    } catch (error) {
      console.log("Error while getting History API", error);
    }
  };

  // function for handling newChat.
  const handleNewChat = async () => {
    setNewChat(true);
    // setChatSessions([...chatSessions, { title: "New Chat", messages: [] }]);
    setChatSessions([{ title: "New Chat", messages: [] }]);
    // setCurrentSessionIndex(chatSessions.length);
    setIsChat(false);
    setQueryQuestion(null);
    setQueryAnswer(null);
  };

  // Function to navigate to home screen
  const handleNavigate = () => {
    navigate("/");
  };

  // Function when the item from the chat history is clicked
  const handleHistoryClick = async (session, index) => {
    const his_res = await axios.get(`${API}/chat_history?username=${username}&chat_record=${session}`);
    console.log(his_res);
    console.log(his_res.data.history);
    setHistory(his_res.data.history)
  };
  console.log('History', history);
  return (
    <section
      className="w-screen h-screen bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${bg_img})` }}
    >
      {/* Header */}
      <nav className="flex items-center justify-between pr-16">
        <img src={logo} className="pl-3" />
        <button
          className="text-xl bg-[#435689] rounded-full p-2"
          title="home"
          onClick={handleNavigate}
        >
          <IoHome className="text-white" />
        </button>
      </nav>

      {/* Body */}
      <div className="relative flex justify-start h-[630px] gap-x-[210px] w-full">
        {/* Sidebar */}
        <div className="relative flex justify-center w-12 h-auto ">
          <BsArrowRightCircleFill
            className="absolute top-2 text-[#666666] text-3xl cursor-pointer"
            onClick={sidebarMotion}
          />
        </div>

        {sidebar ? (
          // Sidebar panel
          <div
            className="w-[223px] h-screen bg-center bg-cover bg-no-repeat absolute -top-14 left-[0px] transition-all duration-75 ease-in-out"
            style={{ backgroundImage: `url(${sidebar_img})` }}
          >
            <nav>
              <img src={logo} className="pl-3 mt-[2.1px]" />
            </nav>

            <div className="flex justify-between mx-1.5 mt-2">
              <div className="flex flex-col w-full pb-3 overflow-hidden gap-y-3 ">
                <div className="flex items-center justify-between">
                  <p>History</p>
                  <BsArrowLeftCircleFill
                    className="text-[25px] text-[#666666] cursor-pointer"
                    onClick={sidebarMotion}
                  />
                </div>

                <div>
                  {/* History */}
                  <ul className="overflow-y-auto h-[530px] overscroll-y-auto">
                    {onreload
                      ? chatHistory.map((session, index) => (
                          <li
                            key={index}
                            className="flex p-1  mx-1 mt-1 mb-4 rounded-md bg-[#b7b6b6] hover:bg-[#dadada] cursor-pointer text-[15px]"
                            onClick={() => handleHistoryClick(session, index)}
                          >
                            <p
                              className="w-full truncate"
                            >
                              {session}
                            </p>
                            <p>
                              <MdDeleteForever className="text-2xl inline-flex hover:text-red-700 hover:transition-all hover:duration-75 hover:ease-in-out text-[#424242]" />
                            </p>
                          </li>
                        ))
                      : chatSessions.map((session, index) => (
                          <li
                            key={index}
                            className="flex justify-between p-1 mx-1 mt-1 mb-4 truncate rounded-md bg-[#b7b6b6] cursor-pointer text-[15px]"
                            onClick={() => handleHistoryClick(index)}
                          >
                            {session.title}
                            <MdDeleteForever className="text-2xl inline-flex hover:text-red-700 hover:transition-all hover:duration-75 hover:ease-in-out text-[#424242]" />
                          </li>
                        ))}
                  </ul>
                </div>
                {/* User Email */}
                <div className="bg-[#dfcfcd] rounded px-0.5 py-1 text-center shadow shadow-gray-600 mx-1 cursor-pointer">
                  <p
                    className="px-1 text-[15px] truncate"
                    onClick={handleNewChat}
                  >
                    New Chat
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Prompt Area */}
        {/* Prompt  */}
        <div className="flex flex-col w-[80%] gap-y-4 mr-36 text-wrap">
          <div className="w-full h-[85%] border-[1px] border-white rounded-tl-[20px] rounded-tr-[50px] rounded-br-[50px] rounded-bl-[30px] pl-3 pr-6 shadow-[-5px_5px_2px_5px_#00000024] shadow-[#5a5a5ab9] overflow-y-scroll no-scrollbar overflow-x-hidden">
            {
              history.length > 1 ? (
                history.map((outcome, index) => {
                  <div
                key={index}
                className="w-full my-3 mt-4 px-3 h-auto bg-[#d9d9d98d] rounded-xl p-4 text-wrap text-clip"
              >
                <p className="flex items-center w-fit gap-x-3">
                  <ImUser className="text-3xl" /> {outcome.question}
                </p>
                <p className="flex items-start mt-3 gap-x-3 min-h-fit max-h-max ">
                  <img src={loading_img} alt="" className="w-8" />
                  {outcome.response}
                </p>
              </div>
                })
              ): (chatSessions[currentSessionIndex].messages.map((chat, index) => (
                <div
                  key={index}
                  className="w-full my-3 mt-4 px-3 h-auto bg-[#d9d9d98d] rounded-xl p-4 text-wrap text-clip"
                >
                  <p className="flex items-center w-fit gap-x-3">
                    <ImUser className="text-3xl" /> {chat.question}
                  </p>
                  <p className="flex items-start mt-3 gap-x-3 min-h-fit max-h-max ">
                    <img src={loading_img} alt="" className="w-8" />
                    {chat.answer}
                  </p>
                </div>
              )))
            }
            {/* {chatSessions[currentSessionIndex].messages.map((chat, index) => (
              <div
                key={index}
                className="w-full my-3 mt-4 px-3 h-auto bg-[#d9d9d98d] rounded-xl p-4 text-wrap text-clip"
              >
                <p className="flex items-center w-fit gap-x-3">
                  <ImUser className="text-3xl" /> {chat.question}
                </p>
                <p className="flex items-start mt-3 gap-x-3 min-h-fit max-h-max ">
                  <img src={loading_img} alt="" className="w-8" />
                  {chat.answer}
                </p>
              </div>
            ))} */}

            {/* {chatSessions[currentSessionIndex].messages.map((chat, index) => (
              <div
                key={index}
                className="w-full my-3 mt-4 px-3 h-auto bg-[#d9d9d98d] rounded-xl p-4 text-wrap text-clip"
              >
                <p className="flex items-center w-fit gap-x-3"><ImUser className="text-3xl" /> {chat.question}</p>
                <p className="flex items-start mt-3 gap-x-3 min-h-fit max-h-max "><img src={loading_img} alt="" className="w-8" />{chat.answer}</p>
              </div>
              <p>
                <img
                  src={loading_animation}
                  alt="loading animation"
                  className="w-[60px]"
                />
              </p>
            ))} */}
          </div>
          <div className="p-1.5 mt-3 bg-white flex justify-between gap-x-7 px-3 rounded-lg items-center w-full h-[10%] input-container-height">
            <textarea
              type="text"
              className="bg-white focus:border-[0.5px] focus:border-[#666666] focus:rounded focus:outline-none w-full resize-none p-1 text-sm h-full  overflow-y-auto"
              rows={1}
              placeholder="Ask me anything regarding finance..."
              onChange={(e) => {
                setText(e.target.value);
              }}
              value={text}
            />
            <img
              src={send_img}
              className="w-8 h-fit hover:cursor-pointer"
              onClick={handleAPI}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromptPage;
