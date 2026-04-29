import type { Static } from '@feathersjs/typebox';
import type { HookContext } from '../../declarations';
export declare const userSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TNumber;
    email: import("@sinclair/typebox").TString<string>;
    name: import("@sinclair/typebox").TString<string>;
    googleId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    avatar: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    password: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
}>;
export type User = Static<typeof userSchema>;
export declare const userValidator: import("@feathersjs/schema").Validator<any, any>;
export declare const userResolver: import("@feathersjs/schema").Resolver<{
    password?: string | undefined;
    googleId?: string | undefined;
    avatar?: string | undefined;
    email: string;
    name: string;
    id: number;
}, HookContext>;
export declare const userExternalResolver: import("@feathersjs/schema").Resolver<{
    password?: string | undefined;
    googleId?: string | undefined;
    avatar?: string | undefined;
    email: string;
    name: string;
    id: number;
}, HookContext>;
export declare const userDataSchema: import("@sinclair/typebox").TObject<{
    email: import("@sinclair/typebox").TString<string>;
    name: import("@sinclair/typebox").TString<string>;
    googleId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    avatar: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    password: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
}>;
export type UserData = Static<typeof userDataSchema>;
export declare const userDataValidator: import("@feathersjs/schema").Validator<any, any>;
export declare const userDataResolver: import("@feathersjs/schema").Resolver<{
    password?: string | undefined;
    googleId?: string | undefined;
    avatar?: string | undefined;
    email: string;
    name: string;
    id: number;
}, HookContext>;
export declare const userPatchSchema: import("@sinclair/typebox").TObject<{
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    googleId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    avatar: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    password: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
}>;
export type UserPatch = Static<typeof userPatchSchema>;
export declare const userPatchValidator: import("@feathersjs/schema").Validator<any, any>;
export declare const userPatchResolver: import("@feathersjs/schema").Resolver<{
    password?: string | undefined;
    googleId?: string | undefined;
    avatar?: string | undefined;
    email: string;
    name: string;
    id: number;
}, HookContext>;
export declare const userQuerySchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    googleId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    $limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    $skip: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    $sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{}>>;
    $select: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>>;
}>;
export type UserQuery = Static<typeof userQuerySchema>;
export declare const userQueryValidator: import("@feathersjs/schema").Validator<any, any>;
export declare const userQueryResolver: import("@feathersjs/schema").Resolver<{
    email?: string | undefined;
    name?: string | undefined;
    id?: number | undefined;
    googleId?: string | undefined;
    $limit?: number | undefined;
    $skip?: number | undefined;
    $sort?: {} | undefined;
    $select?: string[] | undefined;
}, HookContext>;
