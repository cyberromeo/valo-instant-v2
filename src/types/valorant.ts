export interface Ability { slot: string; displayName: string; description: string; displayIcon: string | null }
export interface Role { uuid: string; displayName: string; description: string; displayIcon: string }
export interface Agent {
  uuid: string; displayName: string; description: string; developerName: string;
  displayIcon: string; fullPortrait: string | null; bustPortrait: string | null; killfeedPortrait: string;
  background: string | null; backgroundGradientColors: string[];
  role: Role | null; abilities: Ability[]; isPlayableCharacter: boolean; slug: string;
}
export interface Callout { regionName: string; superRegionName: string; location: { x: number; y: number } }
export interface GameMap {
  uuid: string; displayName: string; narrativeDescription: string | null; tacticalDescription: string | null;
  coordinates: string | null; displayIcon: string | null; listViewIcon: string | null; listViewIconTall: string | null;
  splash: string; premierBackgroundImage: string | null;
  xMultiplier: number; yMultiplier: number; xScalarToAdd: number; yScalarToAdd: number;
  callouts: Callout[] | null; slug: string; competitive: boolean;
}
export interface DamageRange { rangeStartMeters: number; rangeEndMeters: number; headDamage: number; bodyDamage: number; legDamage: number }
export interface WeaponStats {
  fireRate: number; magazineSize: number; runSpeedMultiplier: number; equipTimeSeconds: number; reloadTimeSeconds: number;
  firstBulletAccuracy: number; shotgunPelletCount: number; wallPenetration: string; feature: string | null;
  fireMode: string | null; altFireType: string | null;
  adsStats: { zoomMultiplier: number; fireRate: number; runSpeedMultiplier: number; burstCount: number; firstBulletAccuracy: number } | null;
  damageRanges: DamageRange[];
}
export interface SkinChroma { uuid: string; displayName: string; displayIcon: string | null; fullRender: string; swatch: string | null; streamedVideo: string | null }
export interface SkinLevel { uuid: string; displayName: string; levelItem: string | null; displayIcon: string | null; streamedVideo: string | null }
export interface Skin {
  uuid: string; displayName: string; themeUuid: string; contentTierUuid: string | null; displayIcon: string | null;
  wallpaper: string | null; chromas: SkinChroma[]; levels: SkinLevel[];
}
export interface Weapon {
  uuid: string; displayName: string; category: string; defaultSkinUuid: string; displayIcon: string; killStreamIcon: string;
  weaponStats: WeaponStats | null; shopData: { cost: number; category: string; categoryText: string } | null;
  skins: Skin[]; slug: string; cat: string;
}
export interface ContentTier { uuid: string; displayName: string; devName: string; rank: number; juiceValue: number; juiceCost: number; highlightColor: string; displayIcon: string }
export interface Tier { tier: number; tierName: string; division: string; divisionName: string; color: string; backgroundColor: string; smallIcon: string | null; largeIcon: string | null; rankTriangleDownIcon: string | null; rankTriangleUpIcon: string | null }
export interface CompetitiveTierSet { uuid: string; assetObjectName: string; tiers: Tier[] }
export interface GameMode { uuid: string; displayName: string; description: string | null; duration: string | null; allowsMatchTimeouts: boolean; isTeamVoiceAllowed: boolean; isMinimapHidden: boolean; displayIcon: string | null; listViewIconTall: string | null }
export interface PlayerCard { uuid: string; displayName: string; isHiddenIfNotOwned: boolean; themeUuid: string | null; displayIcon: string; smallArt: string; wideArt: string; largeArt: string }
export interface Buddy { uuid: string; displayName: string; isHiddenIfNotOwned: boolean; themeUuid: string | null; displayIcon: string; levels: { uuid: string; charmLevel: number; displayName: string; displayIcon: string }[] }
export interface Spray { uuid: string; displayName: string; category: string | null; themeUuid: string | null; isNullSpray: boolean; hideIfNotOwned: boolean; displayIcon: string; fullIcon: string | null; fullTransparentIcon: string | null; animationPng: string | null; animationGif: string | null }
export interface PlayerTitle { uuid: string; displayName: string | null; titleText: string | null; isHiddenIfNotOwned: boolean }
export interface Currency { uuid: string; displayName: string; displayNameSingular: string; displayIcon: string; largeIcon: string }
export interface Season { uuid: string; displayName: string; title: string | null; type: string | null; startTime: string; endTime: string; parentUuid: string | null }
export interface Bundle { uuid: string; displayName: string; displayNameSubText: string | null; description: string; extraDescription: string | null; promoDescription: string | null; useAdditionalContext: boolean; displayIcon: string; displayIcon2: string; logoIcon: string | null; verticalPromoImage: string | null }
export interface LevelBorder { uuid: string; displayName: string; startingLevel: number; levelNumberAppearance: string; smallPlayerCardAppearance: string }
export interface Contract { uuid: string; displayName: string; displayIcon: string | null; shipIt: boolean; useLevelVPCostOverride: boolean; levelVPCostOverride: number; freeRewardScheduleUuid: string; content: { relationType: string | null; relationUuid: string | null; chapters: { isEpilogue: boolean; levels: { reward: { type: string; uuid: string; amount: number; isHighlighted: boolean }; xp: number; vpCost: number; isPurchasableWithVP: boolean; doughCost: number; isPurchasableWithDough: boolean }[]; freeRewards: { type: string; uuid: string; amount: number; isHighlighted: boolean }[] | null }[]; premiumRewardScheduleUuid: string | null; premiumVPCost: number } }
export interface Ceremony { uuid: string; displayName: string }
export interface GameEvent { uuid: string; displayName: string; shortDisplayName: string; startTime: string; endTime: string }
export interface VersionInfo { manifestId: string; branch: string; version: string; buildVersion: string; engineVersion: string; riotClientVersion: string; riotClientBuild: string; buildDate: string }
