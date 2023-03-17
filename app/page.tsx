"use client";

import { Loader } from "@/src/components/Loader";
import { Message } from "@/src/components/Message";
import { TextArea } from "@/src/components/TextArea";
import React, { FormEvent, useRef, useState } from "react";

import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { useMutation } from "@tanstack/react-query";

const createChatCompletion = (messages: ChatCompletionRequestMessage[]) => {
  const configuration = new Configuration({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);
  return openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });
};

export default function Home() {
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);

  const ref = useRef<HTMLUListElement>(null);
  const scrollToLastMessage = () => {
    setTimeout(() => {
      ref.current?.children[ref.current?.children.length - 1].scrollIntoView();
    }, 1);
  };
  const mutation = useMutation(
    (newMessages: ChatCompletionRequestMessage[]) =>
      createChatCompletion(newMessages),
    {
      onSuccess: (response) => {
        const newText = response.data.choices[0].message?.content;
        if (!newText) {
          return;
        }
        setMessages((messages) => [
          ...messages,
          {
            role: "assistant",
            content: newText,
          },
        ]);

        scrollToLastMessage();
      },
    }
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const user = String(formData.get("user"));
    const newMessage = {
      role: "user",
      content: user,
    } satisfies ChatCompletionRequestMessage;
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    e.currentTarget.reset();

    mutation.mutate(newMessages);
  };

  return (
    <main className="m-auto max-w-xl flex flex-col px-2 py-8 h-full">
      <div className="flex-1 flex flex-col gap-4 overflow-auto">
        <h1 className="text-sky-400 text-3xl md:text-5xl font-bold text-center">
          ChatGptClone
        </h1>
        <ul ref={ref} className="flex flex-col flex-1">
          {messages.map((message, i) => (
            <Message message={message} key={message.content + i} />
          ))}
          {messages.length === 0 && (
            <li className="self-center mt-5">no message, start conversation</li>
          )}
          {mutation.isLoading && (
            <li
              className="flex item
             w-full p-4"
            >
              <Loader />
              <p className="text-gray-300 animate-pulse">
                ChatGpt is thinking . . .{" "}
              </p>
            </li>
          )}
        </ul>
      </div>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={mutation.isLoading} className="flex items-end ">
          <div className="flex-1 ">
            <TextArea
              className="rounded-lg p-2 w-[95%] text-black"
              name="user"
              label="Message"
            />
          </div>
          <button type="submit" className="border p-2 mb-2 rounded-lg">
            Submit
          </button>
        </fieldset>
      </form>
    </main>
  );
}
