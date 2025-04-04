/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type SignUpParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

declare type LoginUser = {
  email: string;
  password: string;
};

declare type User = {
  $id: string;
  email?: string;
  user_id: string;
  firstName?: string;
  lastName: string;
};

declare type NewUserParams = {
  userId: string;
  email: string;
  name: string;
  password: string;
};

declare interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

declare interface signInProps {
  email: string;
  password: string;
}

declare interface getUserInfoProps {
  user_id: string;
}

declare interface Chat {
  $id: string;
  chat_id: string;
  title: string;
}

declare type ChatPageProps =  {
  params: { chat_id: string };
}

declare type MessageProps = {
  $id: string;
  user_id: string;
  chat_id: string;
  sender: string;
  content: string;
  created_at: Date;
};