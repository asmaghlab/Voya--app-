import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  // التابات اللي هتظهر في الـ bar (من غير Wishlist و Search)
  const visibleRoutes = state.routes.filter(
    (route: any) => route.name !== 'Search' && route.name !== 'Wishlist'
  );

  const middleIndex = Math.floor(visibleRoutes.length / 2);

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {visibleRoutes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.findIndex(
            (r: any) => r.key === route.key
          );
          const IconComponent = options.tabBarIcon;

          const onPress = () => {
            if (!isFocused) {
              navigation.navigate(route.name);
            }
          };

          return (
            <React.Fragment key={route.key}>
              {/* زر Wishlist في النص */}
              {index === middleIndex && (
                <View style={styles.wishlistButtonContainer}>
                  <TouchableOpacity
                    style={styles.wishlistButton}
                    onPress={() => navigation.navigate('Wishlist')}
                    activeOpacity={0.8}
                  >
                    {descriptors[
                      state.routes.find((r: any) => r.name === 'Wishlist')?.key
                    ]?.options?.tabBarIcon?.({
                      color: '#fff',
                      size: 28,
                    })}
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                {IconComponent &&
                  IconComponent({
                    color: isFocused ? '#0ea5e9' : '#94a3b8',
                    size: 24,
                  })}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },

  wishlistButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});

export default CustomTabBar;
