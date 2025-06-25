#include <gtest/gtest.h>

// Ensure that basic tests actually work here. Yoinked from the documentation.
TEST(SanityTest, BasicAssertionsWork)
{
  EXPECT_STRNE("hello", "world");
  EXPECT_EQ(7 * 6, 42);
}